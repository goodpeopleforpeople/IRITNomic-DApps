// app.js - FULLY INTEGRATED WITH REAL CONTRACTS
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.isConnected = false;
        
        this.init();
    }

    async init() {
        await this.loadWeb3();
        await this.loadContracts();
        this.loadEventListeners();
        
        if (this.isConnected) {
            await this.loadWalletData();
        }
    }

    async loadWeb3() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            
            // Check if already connected
            const accounts = await this.web3.eth.getAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.isConnected = true;
                this.updateConnectionStatus(true);
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.account = accounts[0] || null;
                this.isConnected = !!this.account;
                this.updateConnectionStatus(this.isConnected);
                if (this.isConnected) {
                    this.loadWalletData();
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
            
        } else {
            this.showStatus('Please install MetaMask!', 'error');
        }
    }

    async loadContracts() {
        try {
            this.contracts.gasToken = new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN);
            this.contracts.bgsToken = new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN);
            this.contracts.staking = new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING);
            
            console.log('Contracts loaded successfully!');
        } catch (error) {
            console.error('Error loading contracts:', error);
            this.showStatus('Error loading contracts', 'error');
        }
    }

    loadEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.stake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.withdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.burnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.recycleBgs());
    }

    async connectWallet() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = (await this.web3.eth.getAccounts())[0];
            this.isConnected = true;
            this.updateConnectionStatus(true);
            await this.loadWalletData();
            this.showStatus('Wallet connected successfully!', 'success');
        } catch (error) {
            this.showStatus('User denied wallet connection', 'error');
        }
    }

    async loadWalletData() {
        if (!this.account) return;
        
        try {
            // Load token balances
            const gasBalance = await this.contracts.gasToken.methods.balanceOf(this.account).call();
            const bgsBalance = await this.contracts.bgsToken.methods.balanceOf(this.account).call();
            
            document.getElementById('gasBalance').textContent = this.formatNumber(this.web3.utils.fromWei(gasBalance, 'ether'));
            document.getElementById('bgsBalance').textContent = this.formatNumber(this.web3.utils.fromWei(bgsBalance, 'ether'));
            
            // Load staking info
            await this.loadStakingInfo();
            
            this.updateWalletInfo();
            
        } catch (error) {
            console.error('Error loading wallet data:', error);
        }
    }

    async loadStakingInfo() {
        try {
            const stakeInfo = await this.contracts.staking.methods.getUserStakeInfo(this.account).call();
            const [amount, stakedAt, unlockTime, pendingRewards, totalEarned, userShare] = stakeInfo;
            
            const stakingStats = await this.contracts.staking.methods.getStakingStats().call();
            const [totalStaked, totalStakers, remainingBGS, currentAPY] = stakingStats;
            
            // Update UI
            document.getElementById('userStake').textContent = this.formatNumber(this.web3.utils.fromWei(amount, 'ether')) + ' GAS';
            document.getElementById('userShare').textContent = (userShare / 100).toFixed(2) + '%';
            document.getElementById('totalStaked').textContent = this.formatNumber(this.web3.utils.fromWei(totalStaked, 'ether')) + ' GAS';
            document.getElementById('pendingRewards').textContent = this.formatNumber(this.web3.utils.fromWei(pendingRewards, 'ether')) + ' BGS';
            
            // Update APY badge
            document.getElementById('apyBadge').textContent = (currentAPY / 10) + '% APY • ' + totalStakers + ' STAKERS';
            
        } catch (error) {
            console.error('Error loading staking info:', error);
        }
    }

    async stake() {
        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            // 1. Approve Staking contract to spend GAS
            this.showStatus('Approving GAS...', 'info');
            await this.contracts.gasToken.methods.approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
            
            // 2. Execute stake
            this.showStatus('Staking GAS...', 'info');
            await this.contracts.staking.methods.stake(amountWei)
                .send({ from: this.account });
            
            this.showStatus('Successfully staked ' + amount + ' GAS!', 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('Staking error:', error);
            this.showStatus('Staking failed: ' + error.message, 'error');
        }
    }

    async withdrawRewards() {
        try {
            this.showStatus('Withdrawing rewards...', 'info');
            await this.contracts.staking.methods.withdrawRewards()
                .send({ from: this.account });
            
            this.showStatus('Rewards withdrawn successfully!', 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('Withdraw error:', error);
            this.showStatus('Withdraw failed: ' + error.message, 'error');
        }
    }

    async burnGas() {
        const amount = document.getElementById('burnGasAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            this.showStatus('Burning GAS...', 'info');
            await this.contracts.gasToken.methods.burn(amountWei)
                .send({ from: this.account });
            
            this.showStatus('Burned ' + amount + ' GAS successfully!', 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('Burn error:', error);
            this.showStatus('Burn failed: ' + error.message, 'error');
        }
    }

    async recycleBgs() {
        const amount = document.getElementById('recycleBgsAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            // 1. Approve Staking contract to spend BGS
            this.showStatus('Approving BGS...', 'info');
            await this.contracts.bgsToken.methods.approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
            
            // 2. Return to pool
            this.showStatus('Recycling BGS to pool...', 'info');
            await this.contracts.staking.methods.returnBGSToPool(amountWei)
                .send({ from: this.account });
            
            this.showStatus('Recycled ' + amount + ' BGS to pool!', 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('Recycle error:', error);
            this.showStatus('Recycle failed: ' + error.message, 'error');
        }
    }

    updateConnectionStatus(connected) {
        const networkDot = document.getElementById('networkDot');
        const networkName = document.getElementById('networkName');
        
        if (connected) {
            networkDot.className = 'status-dot connected';
            networkName.textContent = 'BSC Testnet Connected';
        } else {
            networkDot.className = 'status-dot';
            networkName.textContent = 'Disconnected';
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

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }

    showStatus(message, type = 'success') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        setTimeout(() => {
            status.classList.add('hidden');
        }, 5000);
    }
}

// Initialize app when page loads
window.addEventListener('load', () => {
    new IritnomicDapp();
});
