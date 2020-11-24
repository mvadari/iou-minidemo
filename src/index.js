const { IssuedCurrencyClient, XrplNetwork, XRPTestUtils } = require('xpring-js')

const grpcUrl = 'test.xrp.xpring.io:50051'
const webSocketUrl = 'wss://wss.test.xrp.xpring.io'



async function main() {
  const issuedCurrencyClient = IssuedCurrencyClient.issuedCurrencyClientWithEndpoint(
    grpcUrl,
    webSocketUrl,
    () => {},
    XrplNetwork.Test,
  )

  console.log('Creating issuing and operational wallets...')

  const issuerWallet = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Issuing Address:', issuerWallet.getAddress())

  const operationalWallet = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Operational Address:', operationalWallet.getAddress(), '\n')

  const operationalTrustLineLimit = '100'
  const issuedCurrencyCurrency = 'FOO'
  
  /*
    STEP 1: CREATING ISSUED CURRENCY
  */
  console.log('Step 1: Creating Issued Currency')
  console.log(`Building trustline from issuer to operational wallet for ${operationalTrustLineLimit} ${issuedCurrencyCurrency}`)

  const operationalTrustLineResult = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    operationalTrustLineLimit,
    operationalWallet,
  )
  console.log(operationalTrustLineResult, '\n')

  const issuedCurrencyAmount = '100'

  console.log(`Creating ${issuedCurrencyAmount} ${issuedCurrencyCurrency} Issued Currency`)
  console.log(`Issued by ${issuerWallet.getAddress()} to ${operationalWallet.getAddress()}`)

  const issuedCurrencyResult = await issuedCurrencyClient.createIssuedCurrency(
    issuerWallet,
    operationalWallet.getAddress(),
    issuedCurrencyCurrency,
    issuedCurrencyAmount,
  )
  console.log(issuedCurrencyResult, '\n')

  /*
    STEP 2: SENDING ISSUED CURRENCY TO CUSTOMER
  */
  console.log('Step 2: Sending Issued Currency to Customer')
  
  console.log('Enable rippling on the issuer wallet (necessary for sending issued currency)')
  
  const enableRipplingResult = await issuedCurrencyClient.enableRippling(issuerWallet)
  console.log(enableRipplingResult, '\n')

  console.log('Creating customer wallet...')

  const customerWallet = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Customer Address:', customerWallet.getAddress(), '\n')

  const customerTrustLineLimit = '100'
  
  console.log(`Building trustline from issuer to customer wallet for ${customerTrustLineLimit} ${issuedCurrencyCurrency}`)
  
  const customerTrustLineResult = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    customerTrustLineLimit,
    customerWallet,
  )
  console.log(customerTrustLineResult, '\n')

  const sendingAmount = '100'

  console.log(`Sending ${sendingAmount} ${issuedCurrencyCurrency} from ${operationalWallet.getAddress()} to ${customerWallet.getAddress()}`)
  
  const sendPaymentResult = await issuedCurrencyClient.sendIssuedCurrencyPayment(
    operationalWallet,
    customerWallet.getAddress(),
    issuedCurrencyCurrency,
    issuerWallet.getAddress(),
    sendingAmount,
  )
  console.log(sendPaymentResult, '\n')

  issuedCurrencyClient.webSocketNetworkClient.close()
}

// Exit with an error code if there is an error. 
process.on('unhandledRejection', error => {
  console.log(`Fatal: ${error}`)
  process.exit(1)
});

main()
