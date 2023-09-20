import React, { useState, useEffect } from "react";
import ErrorMessage from "./ErrorMessage";
import { ethers } from "ethers";
import Web3 from "web3";
import Modal from "react-modal";
import tokenABI from "./abi";

import "./App.css";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

const changeNetwork = async ({ networkName, setError }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum?.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    setError(err.message);
  }
};
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545/"
  )
);

function App() {
  // usetstate for storing and retrieving wallet details
  const [data, setdata] = useState({
    address: "",
    balance: null,
  });
  const [walletAdress, setWalletAdress] = useState("");
  const [balance, setBalance] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [swtBalance, setSwtBalance] = useState("");

  // Button handler button for handling a
  // request event for metamask
  const btnhandler = async () => {
    setIsOpen(true);
    // res[0] for fetching a first wallet
    window.ethereum
      ?.request({ method: "eth_requestAccounts" })
      .then((res) => accountChangeHandler(res[0]));
  };

  // getbalance function for getting a balance in
  // a right format with help of ethers
  const getbalance = (address) => {
    // Requesting balance method
    window.ethereum
      ?.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance) => {
        // Setting balance
        setdata({
          Balance: ethers.utils.formatEther(balance),
        });
      });
  };

  // Function for getting handling all events
  const accountChangeHandler = (account) => {
    // Setting an address data
    setdata({
      address: account,
    });

    // Setting a balance
    getbalance(account);
  };

  const [error, setError] = useState();

  const handleNetworkSwitch = async (networkName) => {
    const met = await window.ethereum?._metamask?.isUnlocked();
    console.log("networkName:", met);

    setError();
    await changeNetwork({ networkName, setError });
  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  useEffect(() => {
    window.ethereum?.on("chainChanged", networkChanged);

    return () => {
      window.ethereum?.removeListener("chainChanged", networkChanged);
    };
  }, []);

  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }

  // Detect change in Metamask account
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

  useEffect(() => {
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        ?.request({ method: "eth_requestAccounts" })
        .then((res) => setWalletAdress(res[0]));
    } else {
      alert("Установите метамаск!!");
    }
  }, []);

  const pullbalance = async () => {
    if (walletAdress) {
      const balance = await web3.eth.getBalance(walletAdress);
      setBalance(web3.utils.fromWei(balance, "ether"));
    }

    const token = await web3.eth.getBalance(
      "0x1676a38Cd7f819859c21165cDa5663b39c73507A"
    );
    setContractAddress(token);

    const currentChainId = await window.ethereum.request({
      method: "net_version",
    });

    const contract = new web3.eth.Contract(
      tokenABI,
      "0x1676a38Cd7f819859c21165cDa5663b39c73507A"
    );
    //0x1676a38Cd7f819859c21165cDa5663b39c73507A
    const swt = await contract.methods
      .balanceOf("0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36")
      .call();
    //0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36
    setSwtBalance(web3.utils.fromWei(swt, "ether"));

    console.log("pp", web3.currentProvider);
  };

  const approveBalance = async () => {
    console.log("approve: ");
    const MyContract = new web3.eth.Contract(
      tokenABI,
      "0x1676a38Cd7f819859c21165cDa5663b39c73507A",
      {
        from: "0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36",
      }
    );
    console.log("MyContract: ", MyContract);

    web3.eth.sendTransaction(
      {
        from: "0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36",
        to: "0x1676a38Cd7f819859c21165cDa5663b39c73507A",
        value: "1000000000000000000",
        chainId: "97",
      },
      function (err, transactionHash) {
        if (err) {
          console.log("Payment failed", err);
        } else {
          console.log(transactionHash);
        }
      }
    );
    /*
    const receipt = await MyContract.methods.approve(
      "0x1676a38Cd7f819859c21165cDa5663b39c73507A",
      "1000000000000000000"
    );
    console.log("receipt:", receipt);
    receipt
      .send({
        from: "0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36",
        gas: 1000000,
      })
      .catch((err) => console.log("err: ", err));
    console.log("Transaction Hash: " + receipt.transactionHash);
    */
  };

  const pay = async () => {
    const contract = new web3.eth.Contract(
      tokenABI,
      "0x1676a38Cd7f819859c21165cDa5663b39c73507A"
    );
    const transfer = await contract.methods.transfer(
      "0xBaF3c4193858876da914F702Ea97491021269d0C",
      10
    );
    console.log("transfer: ", transfer);

    const encodedABI = await transfer.encodeABI();
    console.log("encodedABI:", encodedABI);
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: "0x5A3eEf47D739F3543F8B78fcD8290EBE06358E36",
            to: "0xBaF3c4193858876da914F702Ea97491021269d0C",
            value: "10",
            data: encodedABI,
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
  };

  console.log("window.ethereum.chainId ", window.ethereum.chainId);
  return (
    <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
      <main className="mt-4 p-4">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
          Force MetaMask network
        </h1>
        <div className="mt-4">
          <button
            onClick={() => handleNetworkSwitch("polygon")}
            className="mt-2 mb-2 btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Switch to Polygon
          </button>
          <button
            onClick={() => handleNetworkSwitch("bsc")}
            className="mt-2 mb-2 bg-warning border-warning btn submit-button focus:ring focus:outline-none w-full"
          >
            Switch to BSC
          </button>
          <ErrorMessage message={error} />
          <button onClick={btnhandler}>Open Modal</button>
          <button onClick={pullbalance}>Get Balance</button>
          <button onClick={approveBalance}>Approve</button>
          <button
            onClick={pay}
            className="mt-2 mb-2 bg-warning border-warning btn submit-button focus:ring focus:outline-none w-full"
          >
            Pay
          </button>
          <p>
            in {walletAdress} your balance BNB is: {balance}
          </p>
          <p>
            in {walletAdress} your balance SWT is: {swtBalance}
          </p>
          <Modal
            ariaHideApp={false}
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <h2 style={{ textAlign: "center" }}>Metamask</h2>
            <div style={{ textAlign: "center" }}>
              Connect to your wallet to BNB
            </div>
            <button
              style={{
                display: "flex",
                alignContent: "center",
                alignItems: "center",
                alignSelf: "center",
                justifyContent: "center",
                fontSize: 24,
                width: "100%",
              }}
              onClick={closeModal}
            >
              Connect
            </button>
          </Modal>
        </div>
      </main>
    </div>
  );
}

export default App;
