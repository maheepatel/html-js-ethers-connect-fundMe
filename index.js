// in nodejs - require()

// in frontend JS you can't use require we use - import
import { ethers } from "./ethers-6.4.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      console.log("Connected!")
      connectButton.innerHTML = "connected!"
    } catch (error) {
      console.log(error)
    }
    //   const chainId = await window.ethereum.request({
    //     method: "eth_chainId",
    //   });
  } else {
    console.log("No MetaMask")
    fundButton.innerHTML = "Please install meta mask"
  }
}
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

//fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}....`)
  if (typeof window.ethereum !== "undefined") {
    // provider / connection to the blockchain
    //signer / wallet / someone with some gas
    // contract that we are interaction with
    //  ^ ABI & Address

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // hey, wait for the TX to finish
      await listenForTxMine(transactionResponse, provider)
      console.log("Done!!")
      // console.log(signer)
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTxMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  // Promise resolves after its fired its event and found txHash
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`,
      )
      resolve()
    })
  })
  // listen for this tx to finish
}

// withdraw
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTxMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
