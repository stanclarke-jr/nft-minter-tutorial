import { pinJSONToIPFS } from './pinata';


require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json');
const contractAddress = "0x837f1959a4214c24ed893fb5a434edd460ca9b4e";


export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request ({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top-right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😢 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊 {" "}
            <a href={`https://metamask.io/download.html`} target="_blank" rel="noopener noreferrer">
              You must install Metamask, a virtual Ethereum wallet in your browser.
            </a>
          </p>
        </span>
      ),
    }
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😢 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊 {" "}
            <a href={`https://metamask.io/download.html`} target="_blank" rel="noopener noreferrer">
              You must install Metamask, a virtual Ethereum wallet in your browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async (url, name, description) => {
  // Error handling
  if (url.trim() === "" || (name.trim() === "" || description.trim === "")) {
    return {
      success: false,
      status: "❗ Please make sure all fields are completed before minting.",
    }
  }

  // Create metadata
  const metadata = { url, name, description };

  // Create Pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    }
  }
  const tokenURI = pinataResponse.pinataUrl;

  // Load smart contract
  window.contract = new web3.eth.Contract(contractABI, contractAddress); // loadContract

  // Set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address
    'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI() // Make call to NFT smart contract
  };

  // Sign transaction via Metamask
  try {
    const transactionHash = await window.ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
    return {
      success: true,
      status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + transactionHash
    }
  } catch (error) {
      return {
        success: false,
        status: "😢 Something went wrong: " + error.message
      }
  }

};

