const { IssuedCurrencyClient, XrplNetwork, XRPTestUtils } = require("xpring-js")

const grpcUrl = "test.xrp.xpring.io:50051"
const webSocketUrl = 'wss://wss.test.xrp.xpring.io'



async function main() {
  const issuedCurrencyClient = IssuedCurrencyClient.issuedCurrencyClientWithEndpoint(
    grpcUrl,
    webSocketUrl,
    () => {},
    XrplNetwork.Test,
  )

  console.log("Generating issuing and operational wallets...")

  const issuerWallet = await XRPTestUtils.randomWalletFromFaucet()
  const operationalWallet = await XRPTestUtils.randomWalletFromFaucet()

  console.log("Issuing Address:", issuerWallet.getAddress())
  console.log("Operational Address:", operationalWallet.getAddress(), "\n")

  const trustLineLimit = '100'
  const trustLineCurrency = 'USD'

  console.log(`Building trustline from issuer to operational wallet for ${trustLineLimit} ${trustLineCurrency}`)

  const trustLineResult = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    trustLineCurrency,
    trustLineLimit,
    operationalWallet,
  )

  console.log(trustLineResult)
  console.log("")

  const issuedCurrencyAmount = '100'
  const issuedCurrencyCurrency = trustLineCurrency

  console.log(`Creating ${issuedCurrencyAmount} ${issuedCurrencyCurrency} Issued Currency`)
  console.log(`Issued by ${issuerWallet.getAddress()} to ${operationalWallet.getAddress()}`)

  const issuedCurrencyResult = await issuedCurrencyClient.createIssuedCurrency(
    issuerWallet,
    operationalWallet.getAddress(),
    issuedCurrencyCurrency,
    issuedCurrencyAmount,
  )

  console.log(issuedCurrencyResult)
  issuedCurrencyClient.webSocketNetworkClient.close()
}

// Exit with an error code if there is an error. 
process.on('unhandledRejection', error => {
  console.log(`Fatal: ${error}`)
  process.exit(1)
});

main()
