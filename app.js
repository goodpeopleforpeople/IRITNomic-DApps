// app.js - ALL IN ONE SOLUTION
// ========== CONTRACTS CONFIG ==========
const CONTRACT_ADDRESSES = {
    GAS_TOKEN: "0xF5Cd132Da2F0EC2150E4C0Ac5a2A9473649DF307",
    BGS_TOKEN: "0x34897515163C21f9eA0600A3d0308E1430404f55",
    STAKING: "0xc4079F735425002312c3B60A66cff56576A34a44"
};

// STAKING CONTRACT ABI
const STAKING_ABI = [{"inputs":[{"internalType":"address","name":"_gasToken","type":"address"},{"internalType":"address","name":"_bgsToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newRewardRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"HalvingApplied","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"RewardsDepleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lockedUntil","type":"uint256"}],"name":"Staked","type":"event"},{"inputs":[],"name":"BGS_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"GAS_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"HALVING_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"HALVING_RATE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LOCK_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOTAL_REWARD_POOL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"calculatePendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"executeHalving","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBGSBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHalvingInfo","outputs":[{"internalType":"uint256","name":"nextHalvingTime","type":"uint256"},{"internalType":"uint256","name":"estimatedNextRate","type":"uint256"},{"internalType":"uint256","name":"currentRate","type":"uint256"},{"internalType":"uint256","name":"daysUntilHalving","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getStakingStats","outputs":[{"internalType":"uint256","name":"totalStakedGAS","type":"uint256"},{"internalType":"uint256","name":"totalStakersCount","type":"uint256"},{"internalType":"uint256","name":"remainingBGS","type":"uint256"},{"internalType":"uint256","name":"currentAPY","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStakeInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"stakedAt","type":"uint256"},{"internalType":"uint256","name":"unlockTime","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastHalving","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"stakedAt","type":"uint256"},{"internalType":"uint256","name":"lastRewardPaid","type":"uint256"},{"internalType":"uint256","name":"totalRewardsEarned","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// GAS TOKEN ABI
const GAS_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

// BGS TOKEN ABI
const BGS_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

// ========== BUSINESS LOGIC ==========
class IritnomicManager {
    constructor(web3, contracts, account) {
        this.web3 = web3;
        this.contracts = contracts;
        this.account = account;
    }

    areContractsReady() {
        return this.contracts && this.contracts.gasToken && this.contracts.bgsToken && this.contracts.staking;
    }

    validatePreconditions() {
        if (!this.web3) throw new Error('Web3 not initialized');
        if (!this.areContractsReady()) throw new Error('Contracts not ready');
        if (!this.account) throw new Error('No account connected');
        return true;
    }

    async stake(amount) {
        this.validatePreconditions();
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        
        const currentAllowance = await this.contracts.gasToken.methods
            .allowance(this.account, CONTRACT_ADDRESSES.STAKING).call();

        if (BigInt(currentAllowance) < BigInt(amountWei)) {
            await this.contracts.gasToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
        }

        return await this.contracts.staking.methods.stake(amountWei)
            .send({ from: this.account });
    }

    async withdrawRewards() {
        this.validatePreconditions();
        return await this.contracts.staking.methods.withdrawRewards()
            .send({ from: this.account });
    }

    async burnGas(amount) {
        this.validatePreconditions();
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        return await this.contracts.gasToken.methods.burn(amountWei)
            .send({ from: this.account });
    }

    async recycleBgs(amount) {
        this.validatePreconditions();
        const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
        
        const currentAllowance = await this.contracts.bgsToken.methods
            .allowance(this.account, CONTRACT_ADDRESSES.STAKING).call();

        if (BigInt(currentAllowance) < BigInt(amountWei)) {
            await this.contracts.bgsToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
        }

        return await this.contracts.staking.methods.returnBGSToPool(amountWei)
            .send({ from: this.account });
    }

    async getWalletData() {
        this.validatePreconditions();
        
        try {
            const [gasBalance, bgsBalance, stakingInfo, stakingStats] = await Promise.all([
                this.contracts.gasToken.methods.balanceOf(this.account).call(),
                this.contracts.bgsToken.methods.balanceOf(this.account).call(),
                this.contracts.staking.methods.getUserStakeInfo(this.account).call(),
                this.contracts.staking.methods.getStakingStats().call()
            ]);

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
            if (error.message.includes('User has no stake')) {
                return {
                    balances: { gas: '0', bgs: '0' },
                    staking: {
                        userStake: '0', userShare: '0', pendingRewards: '0',
                        totalStaked: '0', totalStakers: '0', currentAPY: '0'
                    }
                };
            }
            throw error;
        }
    }

    getUserFriendlyError(error) {
        const message = error.message || error.toString();
        if (message.includes('user denied transaction')) return 'Transaction was cancelled';
        if (message.includes('insufficient funds')) return 'Insufficient balance';
        if (message.includes('execution reverted')) {
            const revertMatch = message.match(/execution reverted: ([^"]*)/);
            return revertMatch ? `Transaction failed: ${revertMatch[1]}` : 'Transaction failed';
        }
        if (message.includes('Contracts not ready')) return 'Contracts not ready';
        return message.length > 100 ? message.substring(0, 100) + '...' : message;
    }
}

// ========== UI MANAGEMENT ==========
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.manager = null;
        this.isConnected = false;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing IRITnomic DApp...');
            await this.loadWeb3();
            await this.loadContracts();
            this.initializeManager();
            this.loadEventListeners();
            
            if (this.isConnected && this.areContractsReady()) {
                await this.loadWalletData();
            }
            
            this.isInitialized = true;
            console.log('✅ DApp initialized successfully');
            this.showStatus('DApp ready - Connect your wallet to start', 'info');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showStatus('DApp initialization failed: ' + error.message, 'error');
        }
    }

    areContractsReady() {
        return this.contracts.gasToken && this.contracts.bgsToken && this.contracts.staking;
    }

    async loadWeb3() {
        if (window.ethereum) {
            try {
                this.web3 = new Web3(window.ethereum);
                const chainId = await this.web3.eth.getChainId();
                
                if (chainId !== 97) {
                    this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
                    return;
                }

                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    this.updateConnectionStatus(true);
                }

                window.ethereum.on('accountsChanged', (accounts) => {
                    this.handleAccountsChanged(accounts);
                });

                window.ethereum.on('chainChanged', (chainId) => {
                    this.handleChainChanged(chainId);
                });

            } catch (error) {
                this.showStatus('Failed to initialize Web3: ' + error.message, 'error');
            }
        } else {
            this.showStatus('Please install MetaMask!', 'error');
        }
    }

    async loadContracts() {
        if (!this.web3) throw new Error('Web3 not initialized');

        try {
            this.contracts = {
                gasToken: new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN),
                bgsToken: new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN),
                staking: new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING)
            };

            // Test connections
            await Promise.all([
                this.contracts.gasToken.methods.symbol().call(),
                this.contracts.bgsToken.methods.symbol().call(),
                this.contracts.staking.methods.GAS_TOKEN().call()
            ]);

            console.log('✅ All contracts loaded successfully');
        } catch (error) {
            throw new Error(`Failed to load contracts: ${error.message}`);
        }
    }

    initializeManager() {
        if (this.web3 && this.areContractsReady()) {
            this.manager = new IritnomicManager(this.web3, this.contracts, this.account);
        }
    }

    handleAccountsChanged(accounts) {
        this.account = accounts[0] || null;
        this.isConnected = !!this.account;
        this.updateConnectionStatus(this.isConnected);
        
        if (this.isConnected && this.areContractsReady()) {
            this.manager.account = this.account;
            this.loadWalletData();
        } else {
            this.resetUI();
        }
    }

    handleChainChanged(chainId) {
        const newChainId = parseInt(chainId, 16);
        if (newChainId === 97) {
            this.showStatus('Connected to BSC Testnet', 'success');
            if (this.account) this.loadWalletData();
        } else {
            this.showStatus('Please switch to BSC Testnet', 'error');
            this.updateConnectionStatus(false);
        }
    }

    loadEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.handleStake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.handleWithdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.handleBurnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.handleRecycleBgs());
    }

    async connectWallet() {
        try {
            this.showStatus('Connecting wallet...', 'info');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];
            this.isConnected = true;
            
            if (this.manager) this.manager.account = this.account;
            this.updateConnectionStatus(true);
            await this.loadWalletData();
            
            this.showStatus('Wallet connected successfully!', 'success');
        } catch (error) {
            this.showStatus(error.code === 4001 ? 'User denied connection' : 'Connection failed: ' + error.message, 'error');
        }
    }

    async loadWalletData() {
        if (!this.account || !this.areContractsReady() || !this.manager) return;

        try {
            const data = await this.manager.getWalletData();
            document.getElementById('gasBalance').textContent = this.formatNumber(data.balances.gas);
            document.getElementById('bgsBalance').textContent = this.formatNumber(data.balances.bgs);
            document.getElementById('userStake').textContent = this.formatNumber(data.staking.userStake) + ' GAS';
            document.getElementById('userShare').textContent = data.staking.userShare + '%';
            document.getElementById('totalStaked').textContent = this.formatNumber(data.staking.totalStaked) + ' GAS';
            document.getElementById('pendingRewards').textContent = this.formatNumber(data.staking.pendingRewards) + ' BGS';
            document.getElementById('apyBadge').textContent = data.staking.currentAPY + '% APY • ' + data.staking.totalStakers + ' STAKERS';
            this.updateWalletInfo();
        } catch (error) {
            if (!error.message.includes('User has no stake')) {
                this.showStatus('Failed to load data: ' + error.message, 'error');
            }
        }
    }

    async handleStake() {
        if (!this.validateReadyState()) return;
        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter valid amount', 'error');
            return;
        }
        try {
            this.showStatus('Staking...', 'info');
            await this.manager.stake(amount);
            this.showStatus(`Staked ${amount} GAS!`, 'success');
            await this.loadWalletData();
            document.getElementById('stakeAmount').value = '';
        } catch (error) {
            this.showStatus('Staking failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleWithdrawRewards() {
        if (!this.validateReadyState()) return;
        try {
            this.showStatus('Withdrawing...', 'info');
            await this.manager.withdrawRewards();
            this.showStatus('Rewards withdrawn!', 'success');
            await this.loadWalletData();
        } catch (error) {
            this.showStatus('Withdraw failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleBurnGas() {
        if (!this.validateReadyState()) return;
        const amount = document.getElementById('burnGasAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter valid amount', 'error');
            return;
        }
        try {
            this.showStatus('Burning...', 'info');
            await this.manager.burnGas(amount);
            this.showStatus(`Burned ${amount} GAS!`, 'success');
            await this.loadWalletData();
            document.getElementById('burnGasAmount').value = '';
        } catch (error) {
            this.showStatus('Burn failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    async handleRecycleBgs() {
        if (!this.validateReadyState()) return;
        const amount = document.getElementById('recycleBgsAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter valid amount', 'error');
            return;
        }
        try {
            this.showStatus('Recycling...', 'info');
            await this.manager.recycleBgs(amount);
            this.showStatus(`Recycled ${amount} BGS!`, 'success');
            await this.loadWalletData();
            document.getElementById('recycleBgsAmount').value = '';
        } catch (error) {
            this.showStatus('Recycle failed: ' + this.manager.getUserFriendlyError(error), 'error');
        }
    }

    validateReadyState() {
        if (!this.isConnected) {
            this.showStatus('Please connect wallet first', 'error');
            return false;
        }
        if (!this.areContractsReady()) {
            this.showStatus('Contracts not ready', 'error');
            return false;
        }
        if (!this.manager) {
            this.showStatus('System not initialized', 'error');
            return false;
        }
        return true;
    }

    updateConnectionStatus(connected) {
        const networkDot = document.getElementById('networkDot');
        const networkName = document.getElementById('networkName');
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');

        if (connected) {
            networkDot.className = 'status-dot connected';
            networkName.textContent = 'BSC Testnet Connected';
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
        } else {
            networkDot.className = 'status-dot';
            networkName.textContent = 'Disconnected';
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
            this.resetUI();
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('walletInfo');
        const connectBtn = document.getElementById('connectWallet');
        if (this.account) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            document.getElementById('walletAddress').textContent = 
                this.account.substring(0, 6) + '...' + this.account.substring(38);
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }

    resetUI() {
        document.getElementById('userStake').textContent = '0 GAS';
        document.getElementById('userShare').textContent = '0%';
        document.getElementById('totalStaked').textContent = '0 GAS';
        document.getElementById('pendingRewards').textContent = '0 BGS';
        document.getElementById('gasBalance').textContent = '0';
        document.getElementById('bgsBalance').textContent = '0';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('burnGasAmount').value = '';
        document.getElementById('recycleBgsAmount').value = '';
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        if (type === 'success' || type === 'info') {
            setTimeout(() => status.classList.add('hidden'), 5000);
        }
    }
}

// Initialize app
window.addEventListener('load', () => {
    window.iritnomicDapp = new IritnomicDapp();
});
