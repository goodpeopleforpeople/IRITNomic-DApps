// app.js - DEBUG VERSION (FULL)
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.isConnected = false;
        this.isInitialized = false;
        
        console.log('🔄 DApp Constructor Called');
        this.showStatus('Starting DApp...', 'info');
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing IRITnomic DApp...');
            this.showStatus('Initializing DApp...', 'info');
            
            // Step-by-step initialization dengan delay untuk debugging
            console.log('1. Loading Web3...');
            await this.loadWeb3();
            
            console.log('2. Loading Contracts...');
            await this.loadContracts();
            
            console.log('3. Loading Event Listeners...');
            this.loadEventListeners();
            
            console.log('4. Checking Connection...');
            if (this.isConnected && this.areContractsLoaded()) {
                console.log('5. Loading Wallet Data...');
                await this.loadWalletData();
            }
            
            this.isInitialized = true;
            console.log('✅ DApp initialized successfully');
            this.showStatus('DApp ready - Connect your wallet to start', 'success');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showStatus('DApp initialization failed: ' + error.message, 'error');
        }
    }

    areContractsLoaded() {
        const loaded = this.contracts.gasToken && this.contracts.bgsToken && this.contracts.staking;
        console.log('📋 Contracts loaded check:', loaded);
        return loaded;
    }

    async loadWeb3() {
        console.log('🌐 Checking for Ethereum provider...');
        
        if (window.ethereum) {
            console.log('✅ MetaMask/Wallet detected');
            
            try {
                this.web3 = new Web3(window.ethereum);
                console.log('🔗 Web3 instance created');

                // Check if we're already connected
                console.log('📱 Checking existing accounts...');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                console.log('Found accounts:', accounts);
                
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    console.log('✅ Auto-connected to account:', this.account);
                    this.updateConnectionStatus(true);
                    this.showStatus('Wallet auto-connected!', 'success');
                } else {
                    console.log('ℹ️ No accounts found, user needs to connect');
                    this.showStatus('Please connect your wallet', 'info');
                }

                // Setup event listeners
                this.setupEventListeners();

            } catch (error) {
                console.error('❌ Web3 initialization error:', error);
                this.showStatus('Web3 error: ' + error.message, 'error');
            }
        } else {
            console.error('❌ No Ethereum provider found');
            this.showStatus('Please install MetaMask!', 'error');
        }
    }

    setupEventListeners() {
        if (!window.ethereum) return;
        
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('🔄 Accounts changed:', accounts);
            this.handleAccountsChanged(accounts);
        });

        window.ethereum.on('chainChanged', (chainId) => {
            console.log('🔄 Chain changed:', chainId);
            window.location.reload();
        });
    }

    handleAccountsChanged(accounts) {
        this.account = accounts[0] || null;
        this.isConnected = !!this.account;
        console.log('📝 Account updated:', this.account);
        this.updateConnectionStatus(this.isConnected);
        
        if (this.isConnected && this.areContractsLoaded()) {
            this.loadWalletData();
        } else {
            this.resetUI();
        }
    }

    async loadContracts() {
        if (!this.web3) {
            console.error('❌ Web3 not available for contract loading');
            return;
        }

        try {
            console.log('📄 Loading contracts...');
            
            // Initialize basic contracts without complex validation
            this.contracts = {
                gasToken: new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN),
                bgsToken: new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN),
                staking: new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING)
            };

            console.log('✅ Contract instances created');
            
        } catch (error) {
            console.error('❌ Contract loading failed:', error);
            this.showStatus('Contract loading failed: ' + error.message, 'error');
        }
    }

    loadEventListeners() {
        console.log('🎯 Setting up UI event listeners...');
        
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.stake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.withdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.burnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.recycleBgs());
        
        console.log('✅ Event listeners loaded');
    }

    async connectWallet() {
        console.log('🎮 Connect Wallet button clicked');
        
        if (!window.ethereum) {
            this.showStatus('Please install MetaMask first!', 'error');
            return;
        }

        try {
            this.showStatus('🔄 Connecting to wallet...', 'info');
            console.log('1. Requesting accounts...');
            
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            console.log('2. Accounts received:', accounts);
            
            if (accounts.length === 0) {
                throw new Error('No accounts received');
            }
            
            this.account = accounts[0];
            this.isConnected = true;
            
            console.log('3. Updating connection status...');
            this.updateConnectionStatus(true);
            
            console.log('4. Loading wallet data...');
            await this.loadWalletData();
            
            console.log('✅ Wallet connection completed');
            this.showStatus('🎉 Wallet connected successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            
            if (error.code === 4001) {
                this.showStatus('User denied wallet connection', 'error');
            } else {
                this.showStatus('Connection failed: ' + error.message, 'error');
            }
        }
    }

    async loadWalletData() {
        if (!this.account || !this.areContractsLoaded()) {
            console.log('⏸️ Skipping wallet data load - missing account or contracts');
            return;
        }

        try {
            console.log('📊 Loading wallet data...');
            
            // Load token balances
            const gasBalance = await this.contracts.gasToken.methods.balanceOf(this.account).call();
            const bgsBalance = await this.contracts.bgsToken.methods.balanceOf(this.account).call();

            document.getElementById('gasBalance').textContent = 
                this.formatNumber(this.web3.utils.fromWei(gasBalance, 'ether'));
            document.getElementById('bgsBalance').textContent = 
                this.formatNumber(this.web3.utils.fromWei(bgsBalance, 'ether'));

            console.log('✅ Balances loaded - GAS:', gasBalance, 'BGS:', bgsBalance);

            // Load staking info
            await this.loadStakingInfo();
            this.updateWalletInfo();

            console.log('✅ Wallet data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading wallet data:', error);
            this.showStatus('Failed to load wallet data', 'error');
        }
    }

    async loadStakingInfo() {
        try {
            console.log('📈 Loading staking info...');
            
            const stakeInfo = await this.contracts.staking.methods.getUserStakeInfo(this.account).call();
            const [amount, stakedAt, unlockTime, pendingRewards, totalEarned, userShare] = stakeInfo;

            // Update UI
            document.getElementById('userStake').textContent = 
                this.formatNumber(this.web3.utils.fromWei(amount, 'ether')) + ' GAS';
            document.getElementById('userShare').textContent = 
                (userShare / 100).toFixed(2) + '%';
            document.getElementById('pendingRewards').textContent = 
                this.formatNumber(this.web3.utils.fromWei(pendingRewards, 'ether')) + ' BGS';

            console.log('✅ Staking info loaded');

        } catch (error) {
            console.error('❌ Error loading staking info:', error);
            // Don't show error for users who haven't staked
        }
    }

    async stake() {
        console.log('💰 Stake button clicked');
        
        if (!this.validatePreconditions()) return;

        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            this.showStatus('Approving GAS tokens...', 'info');
            
            await this.contracts.gasToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
                
            this.showStatus('Staking GAS...', 'info');
            
            await this.contracts.staking.methods.stake(amountWei)
                .send({ from: this.account });

            this.showStatus(`Staked ${amount} GAS successfully!`, 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('❌ Staking error:', error);
            this.showStatus('Staking failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async withdrawRewards() {
        console.log('💸 Withdraw rewards clicked');
        
        if (!this.validatePreconditions()) return;

        try {
            this.showStatus('Withdrawing rewards...', 'info');
            
            await this.contracts.staking.methods.withdrawRewards()
                .send({ from: this.account });

            this.showStatus('Rewards withdrawn!', 'success');
            await this.loadWalletData();

        } catch (error) {
            console.error('❌ Withdraw error:', error);
            this.showStatus('Withdraw failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async burnGas() {
        console.log('🔥 Burn GAS clicked');
        
        if (!this.validatePreconditions()) return;

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

            this.showStatus(`Burned ${amount} GAS!`, 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('❌ Burn error:', error);
            this.showStatus('Burn failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async recycleBgs() {
        console.log('♻️ Recycle BGS clicked');
        
        if (!this.validatePreconditions()) return;

        const amount = document.getElementById('recycleBgsAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');

            this.showStatus('Approving BGS...', 'info');
            
            await this.contracts.bgsToken.methods
                .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                .send({ from: this.account });
                
            this.showStatus('Recycling BGS...', 'info');
            
            await this.contracts.staking.methods.returnBGSToPool(amountWei)
                .send({ from: this.account });

            this.showStatus(`Recycled ${amount} BGS!`, 'success');
            await this.loadWalletData();
            
        } catch (error) {
            console.error('❌ Recycle error:', error);
            this.showStatus('Recycle failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    validatePreconditions() {
        if (!this.isConnected) {
            this.showStatus('Please connect your wallet first', 'error');
            return false;
        }
        
        if (!this.areContractsLoaded()) {
            this.showStatus('Contracts not ready', 'error');
            return false;
        }
        
        return true;
    }

    getUserFriendlyError(error) {
        const message = error.message || error.toString();
        
        if (message.includes('user denied transaction')) {
            return 'Transaction cancelled';
        }
        if (message.includes('insufficient funds')) {
            return 'Insufficient balance';
        }
        
        return message;
    }

    updateConnectionStatus(connected) {
        console.log('🔄 Updating connection status:', connected);
        
        const networkDot = document.getElementById('networkDot');
        const networkName = document.getElementById('networkName');
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');

        if (connected) {
            console.log('✅ Setting status: Connected');
            networkDot.className = 'status-dot connected';
            networkName.textContent = 'BSC Testnet Connected';
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            
            if (this.account) {
                document.getElementById('walletAddress').textContent = 
                    this.account.substring(0, 6) + '...' + this.account.substring(38);
            }
        } else {
            console.log('🔴 Setting status: Disconnected');
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
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }

    resetUI() {
        console.log('🔄 Resetting UI to default state');
        document.getElementById('userStake').textContent = '0 GAS';
        document.getElementById('userShare').textContent = '0%';
        document.getElementById('totalStaked').textContent = '0 GAS';
        document.getElementById('pendingRewards').textContent = '0 BGS';
        document.getElementById('gasBalance').textContent = '0';
        document.getElementById('bgsBalance').textContent = '0';
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        console.log(`📢 Status (${type}):`, message);
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize app when page loads
window.addEventListener('load', () => {
    console.log('🖥️ Page fully loaded');
    console.log('Window.ethereum available:', !!window.ethereum);
    console.log('Web3 available:', !!window.Web3);
    console.log('GAS_ABI available:', !!window.GAS_ABI);
    console.log('CONTRACT_ADDRESSES available:', !!window.CONTRACT_ADDRESSES);
    
    window.iritnomicDapp = new IritnomicDapp();
});
