async function main() {
  const Fall = await ethers.getContractFactory("Fall")

  // Start deployment, returning a promise that resolves to a contract object
  const fall = await Fall.deploy()
  console.log("Contract deployed to address:", fall.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
