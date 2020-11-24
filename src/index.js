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
    PART 1: CREATING ISSUED CURRENCY
  */
  console.log('')
  console.log('Part 1: Creating Issued Currency')
  
  console.log(`Building trustline from operational to issuer wallet`)
  console.log(`- Trust Extender (operational wallet): ${operationalWallet.getAddress()}`)
  console.log(`- Issuer: ${issuerWallet.getAddress()}`)
  console.log(`- Amount: ${operationalTrustLineLimit} ${issuedCurrencyCurrency}`)

  const operationalTrustLineResult = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    operationalTrustLineLimit,
    operationalWallet,
  )
  console.log(operationalTrustLineResult, '\n')

  const issuedCurrencyAmount = '100'

  console.log(`Creating Issued Currency`)
  console.log(`Amount: ${issuedCurrencyAmount} ${issuedCurrencyCurrency}`)
  console.log(`Issuer: ${issuerWallet.getAddress()}`)
  console.log(`Issued to: ${operationalWallet.getAddress()}`)

  const issuedCurrencyResult = await issuedCurrencyClient.createIssuedCurrency(
    issuerWallet,
    operationalWallet.getAddress(),
    issuedCurrencyCurrency,
    issuedCurrencyAmount,
  )
  console.log(issuedCurrencyResult, '\n')

  /*
    PART 2: SENDING ISSUED CURRENCY TO CUSTOMER
  */
  console.log('')
  console.log('Part 2: Sending Issued Currency to Customer')
  
  console.log('Enable rippling on the issuer wallet (necessary for sending issued currency)')
  
  const enableRipplingResult = await issuedCurrencyClient.enableRippling(issuerWallet)
  console.log(enableRipplingResult, '\n')

  console.log('Creating customer wallet...')

  const customerWallet = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Customer Address:', customerWallet.getAddress(), '\n')

  const customerTrustLineLimit = '100'
  
  console.log(`Building trustline from issuer to customer wallet`)
  console.log(`- Trust Extender (customer wallet): ${customerWallet.getAddress()}`)
  console.log(`- Issuer: ${issuerWallet.getAddress()}`)
  console.log(`- Amount: ${customerTrustLineLimit} ${issuedCurrencyCurrency}`)
  
  const customerTrustLineResult = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    customerTrustLineLimit,
    customerWallet,
  )
  console.log(customerTrustLineResult, '\n')

  const sendingAmount = '100'

  console.log(`Sending Issued Currency`)
  console.log(`- Amount: ${sendingAmount} ${issuedCurrencyCurrency}`)
  console.log(`- Sender: ${operationalWallet.getAddress()}`)
  console.log(`- Destination: ${customerWallet.getAddress()}`)
  
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
