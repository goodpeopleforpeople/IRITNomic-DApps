// main.js - CORE BUSINESS LOGIC
class IritnomicManager {
    constructor(web3, contracts, account) {
        this.web3 = web3;
        this.contracts = contracts;
        this.account = account;
    }

    // ✅ Check if contracts are ready
    areContractsReady() {
        return this.contracts && 
               this.contracts.gasToken && 
               this.contracts.bgsToken && 
               this.contracts.staking;
    }

    // ✅ Validate preconditions for transactions
    validatePreconditions() {
        if (!this.web3) {
            throw new Error('Web3 not initialized');
        }
        if (!this.areContractsReady()) {
            throw new Error('Contracts not ready. Please wait...');
        }
        if (!this.account) {
            throw new Error('No account connected');
        }
        return true;
    }

    // 🎯 STAKE FUNCTIONS
    async stake(amount) {
        this.validatePreconditions();
        
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        
        // Check allowance first
        const currentAllowance = await this.contracts.gasToken.methods
            .allowance(this.account, CONTRACT_ADDRESSES.STAKING)
            .call();

        // Approve if needed
        if (BigInt(currentAllowance) < BigInt(amountWei)) {
            await this.contracts.gasToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
        }

        // Execute stake
        return await this.contracts.staking.methods.stake(amountWei)
            .send({ from: this.account });
    }

    async withdrawRewards() {
        this.validatePreconditions();
        return await this.contracts.staking.methods.withdrawRewards()
            .send({ from: this.account });
    }

    // 🔥 BURN FUNCTIONS
    async burnGas(amount) {
        this.validatePreconditions();
        
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        return await this.contracts.gasToken.methods.burn(amountWei)
            .send({ from: this.account });
    }

    // ♻️ RECYCLE FUNCTIONS
    async recycleBgs(amount) {
        this.validatePreconditions();
        
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        
        // Check allowance first
        const currentAllowance = await this.contracts.bgsToken.methods
            .allowance(this.account, CONTRACT_ADDRESSES.STAKING)
            .call();

        // Approve if needed
        if (BigInt(currentAllowance) < BigInt(amountWei)) {
            await this.contracts.bgsToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
        }

        // Return to pool
        return await this.contracts.staking.methods.returnBGSToPool(amountWei)
            .send({ from: this.account });
    }

    // 📊 DATA FETCHING FUNCTIONS
    async getWalletData() {
        this.validatePreconditions();
        
        try {
            const [gasBalance, bgsBalance, stakingInfo, stakingStats] = await Promise.all([
                this.contracts.gasToken.methods.balanceOf(this.account).call(),
                this.contracts.bgsToken.methods.balanceOf(this.account).call(),
                this.contracts.staking.methods.getUserStakeInfo(this.account).call(),
                this.contracts.staking.methods.getStakingStats().call()
            ]);

            // ✅ PERHATIAN: Return values match dengan ABI
            const [amount, stakedAt, unlockTime, pendingRewards, totalEarned, userShare] = stakingInfo;
            const [totalStakedGAS, totalStakersCount, remainingBGS, currentAPY] = stakingStats;

            return {
                balances: {
                    gas: this.web3.utils.fromWei(gasBalance, 'ether'),
                    bgs: this.web3.utils.fromWei(bgsBalance, 'ether')
                },
                staking: {
                    userStake: this.web3.utils.fromWei(amount, 'ether'),
                    userShare: (userShare / 100).toFixed(2),
                    pendingRewards: this.web3.utils.fromWei(pendingRewards, 'ether'),
                    totalStaked: this.web3.utils.fromWei(totalStakedGAS, 'ether'),
                    totalStakers: totalStakersCount,
                    currentAPY: currentAPY
                }
            };
        } catch (error) {
            console.error('Error in getWalletData:', error);
            // Return default values jika user belum stake
            if (error.message.includes('User has no stake')) {
                return {
                    balances: {
                        gas: '0',
                        bgs: '0'
                    },
                    staking: {
                        userStake: '0',
                        userShare: '0',
                        pendingRewards: '0',
                        totalStaked: '0',
                        totalStakers: '0',
                        currentAPY: '0'
                    }
                };
            }
            throw error;
        }
    }

    async getContractStatus() {
        try {
            if (!this.areContractsReady()) {
                return { ready: false, message: 'Contracts not loaded' };
            }

            const [gasSymbol, bgsSymbol, totalStaked] = await Promise.all([
                this.contracts.gasToken.methods.symbol().call(),
                this.contracts.bgsToken.methods.symbol().call(),
                this.contracts.staking.methods.totalStaked().call()
            ]);

            return {
                ready: true,
                gasToken: gasSymbol,
                bgsToken: bgsSymbol,
                totalStaked: this.web3.utils.fromWei(totalStaked, 'ether')
            };
        } catch (error) {
            return { ready: false, message: error.message };
        }
    }

    // 🛡️ ERROR HANDLING
    getUserFriendlyError(error) {
        const message = error.message || error.toString();
        
        if (message.includes('user denied transaction')) {
            return 'Transaction was cancelled';
        }
        if (message.includes('insufficient funds')) {
            return 'Insufficient balance for transaction';
        }
        if (message.includes('execution reverted')) {
            const revertMatch = message.match(/execution reverted: ([^"]*)/);
            return revertMatch ? `Transaction failed: ${revertMatch[1]}` : 'Transaction failed';
        }
        if (message.includes('Contracts not ready')) {
            return 'Contracts not ready. Please refresh the page';
        }
        
        return message.length > 100 ? message.substring(0, 100) + '...' : message;
    }
}
