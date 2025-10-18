// app.js - FULLY FIXED VERSION
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.isConnected = false;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing IRITnomic DApp...');
            
            await this.loadWeb3();
            await this.loadContracts();
            this.loadEventListeners();
            
            if (this.isConnected && this.areContractsLoaded()) {
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

    areContractsLoaded() {
        return this.contracts.gasToken && this.contracts.bgsToken && this.contracts.staking;
    }

    async loadWeb3() {
        if (window.ethereum) {
            try {
                this.web3 = new Web3(window.ethereum);
                console.log('🔗 Web3 initialized');

                // Check current network
                const chainId = await this.web3.eth.getChainId();
                console.log('🌐 Current chain ID:', chainId);
                
                if (chainId !== 97) {
                    this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
                    this.updateConnectionStatus(false);
                    return;
                }

                // Check existing accounts
                const accounts = await this.web3.eth.getAccounts();
                console.log('📱 Found accounts:', accounts);
                
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    this.updateConnectionStatus(true);
                    console.log('✅ Auto-connected to account:', this.account);
                }

                // Setup event listeners
                this.setupEventListeners();

            } catch (error) {
                console.error('❌ Web3 initialization error:', error);
                this.showStatus('Failed to initialize Web3: ' + error.message, 'error');
            }
        } else {
            this.showStatus('Please install MetaMask or another Web3 wallet!', 'error');
        }
    }

    setupEventListeners() {
        window.ethereum.on('accountsChanged', (accounts) => {
            this.handleAccountsChanged(accounts);
        });

        window.ethereum.on('chainChanged', (chainId) => {
            this.handleChainChanged(chainId);
        });

        window.ethereum.on('connect', (connectInfo) => {
            console.log('🔗 Wallet connected:', connectInfo);
            this.handleWalletConnect();
        });

        window.ethereum.on('disconnect', (error) => {
            console.log('🔴 Wallet disconnected:', error);
            this.handleWalletDisconnect();
        });
    }

    handleAccountsChanged(accounts) {
        console.log('🔄 Accounts changed:', accounts);
        this.account = accounts[0] || null;
        this.isConnected = !!this.account;
        this.updateConnectionStatus(this.isConnected);
        
        if (this.isConnected && this.areContractsLoaded()) {
            this.loadWalletData();
        } else {
            this.resetUI();
        }
    }

    handleChainChanged(chainId) {
        console.log('🔄 Chain changed:', chainId);
        const newChainId = parseInt(chainId, 16);
        
        if (newChainId === 97) {
            this.showStatus('Connected to BSC Testnet', 'success');
            if (this.account) {
                this.loadWalletData();
            }
        } else {
            this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
            this.updateConnectionStatus(false);
        }
    }

    handleWalletConnect() {
        console.log('✅ Wallet connected');
        this.updateConnectionStatus(true);
    }

    handleWalletDisconnect() {
        console.log('🔴 Wallet disconnected');
        this.isConnected = false;
        this.account = null;
        this.updateConnectionStatus(false);
        this.resetUI();
    }

    async loadContracts() {
        if (!this.web3) {
            throw new Error('Web3 not initialized');
        }

        try {
            console.log('📄 Loading contracts...');
            
            // Validate contract addresses
            this.validateContractAddresses();
            
            // Initialize contracts with timeout
            await Promise.race([
                this.initializeContracts(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Contract loading timeout')), 10000)
                )
            ]);
            
            // Test contract connections
            await this.testContractConnection();
            
            console.log('✅ All contracts loaded successfully');
            
        } catch (error) {
            console.error('❌ Contract loading failed:', error);
            throw new Error(`Failed to load contracts: ${error.message}`);
        }
    }

    validateContractAddresses() {
        const { GAS_TOKEN, BGS_TOKEN, STAKING } = CONTRACT_ADDRESSES;
        
        if (!GAS_TOKEN || !BGS_TOKEN || !STAKING) {
            throw new Error('Contract addresses not defined');
        }
        
        if (!this.isValidAddress(GAS_TOKEN) || !this.isValidAddress(BGS_TOKEN) || !this.isValidAddress(STAKING)) {
            throw new Error('Invalid contract address format');
        }
    }

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async initializeContracts() {
        if (!GAS_ABI || !BGS_ABI || !STAKING_ABI) {
            throw new Error('Contract ABIs not defined');
        }

        this.contracts = {
            gasToken: new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN),
            bgsToken: new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN),
            staking: new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING)
        };

        console.log('📝 Contract instances created');
    }

    async testContractConnection() {
        try {
            // Test GAS token
            const gasSymbol = await this.contracts.gasToken.methods.symbol().call();
            console.log('✅ GAS Token connected:', gasSymbol);
            
            // Test BGS token  
            const bgsSymbol = await this.contracts.bgsToken.methods.symbol().call();
            console.log('✅ BGS Token connected:', bgsSymbol);
            
            // Test staking contract
            const gasTokenAddress = await this.contracts.staking.methods.GAS_TOKEN().call();
            console.log('✅ Staking contract connected. GAS Token:', gasTokenAddress);
            
        } catch (error) {
            console.error('❌ Contract connection test failed:', error);
            throw new Error(`Contract connection failed: ${error.message}`);
        }
    }

    loadEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.stake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.withdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.burnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.recycleBgs());
        
        console.log('🎯 Event listeners loaded');
    }

    async connectWallet() {
        try {
            this.showStatus('Connecting wallet...', 'info');
            
            // Request account access
            await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Get accounts
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];
            this.isConnected = true;
            
            this.updateConnectionStatus(true);
            await this.loadWalletData();
            
            this.showStatus('Wallet connected successfully!', 'success');
            console.log('✅ Wallet connected:', this.account);
            
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            
            if (error.code === 4001) {
                this.showStatus('User denied wallet connection', 'error');
            } else {
                this.showStatus('Wallet connection failed: ' + error.message,
