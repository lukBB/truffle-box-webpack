import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/MetaCoin.json";
import itemManagerArtifact from "../../build/contracts/ItemManager.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  networkId: null,
  itemManager: null,

  start: async function() {

    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      this.networkId = networkId;
      const deployedNetwork = await metaCoinArtifact.networks[networkId];
      const deployedNetworkIM = await itemManagerArtifact.networks[networkId];
      console.log(deployedNetwork.address);
      console.log(deployedNetworkIM.address);
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address,
      );

      this.itemManager = new web3.eth.Contract(itemManagerArtifact.abi, deployedNetworkIM.address);
 
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.listenToPaymentEvent();
        
      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function() {
    const { getBalance } = this.meta.methods;
    const balance = await getBalance(this.account).call();

    //const balanceElement = document.getElementsByClassName("balance")[0];
    //balanceElement.innerHTML = balance;
  },

  sendCoin: async function() {
    const amount = parseInt(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    const { sendCoin } = this.meta.methods;
    await sendCoin(receiver, amount).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  getOwner: async function() {

    const { getBalance, getOwner } = this.meta.methods;
    const balance = await getBalance(this.account).call();
    const owner = await getOwner().call();
    console.log(owner)
    const ownerElement = document.getElementsByClassName("owner")[0];
    ownerElement.innerHTML = owner;

  },

  getChainId: async function(){
    const { web3 } = this;
    const netId = await web3.eth.net.getId();
    console.log(netId)
  },

  createItem: async function() { 
    const id = document.getElementById("id").value;
    const price = parseInt(document.getElementById("price").value);

    if(!id || !price ) { 
      alert("Both field are required");
      return;
    }

    const { createItem } = this.itemManager.methods;

    await createItem(id, price).send({ from: this.account }).then((results)=> {
      let address = results.events.SupplyChainStep.returnValues._itemAddress;
      let itemIndex = results.events.SupplyChainStep.returnValues._itemIndex;
      let step = results.events.SupplyChainStep.returnValues._step;
      alert("Contract " + address + ", ID: " + itemIndex + ", Price: " + price);
      console.log(results)
    }).then(() => { 
      this.resetForm();
      this.setStatus("Item added");
      
    });

  },

  resetForm: function() { 
    document.getElementById("id").value = "";
    document.getElementById("price").value = "";
  },

  getItem: async function() { 
    const index = parseInt(document.getElementById("index").value);
    if(index >= 0) { 

    }
    else { 
      alert("Please provide ID");
      return;
    }
    
    const { items } = this.itemManager.methods;

    const item = await items(index).call()

    if(item[0]==="0x0000000000000000000000000000000000000000"){
      alert("There is no item with index " + index)
      return;
    }

    console.log(item)

    this.setItemBox(item);
    
  }, 

  setItemBox: function(item) {
    const itemBox = document.getElementById("itemBox");
    itemBox.innerHTML = "Contract " + item[0] + ", ID: " + item[1] + ", Price: " + item[2];
  },

  listenToPaymentEvent: async function () { 
    this.itemManager.events.SupplyChainStep().on("data", async function(e) { 
      console.log(e)
    })
  }


};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
