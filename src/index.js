const { IssuedCurrencyClient, XrplNetwork, XRPTestUtils, TransactionStatus } = require('xpring-js')

const grpcUrl = 'test.xrp.xpring.io:50051'
const webSocketUrl = 'wss://wss.test.xrp.xpring.io'



async function main() {
  const issuedCurrencyClient = IssuedCurrencyClient.issuedCurrencyClientWithEndpoint(
    grpcUrl,
    webSocketUrl,
    () => {},
    XrplNetwork.Test,
  )

  console.log('Creating issuing wallet...\n')

  const issuerWallet = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Issuing Address:', issuerWallet.getAddress(), '\n')

  console.log('Creating customer wallet...\n')

  const customerWallet1 = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Customer Address:', customerWallet1.getAddress(), '\n')

  const customerTrustLineLimit1 = '100'
  const issuedCurrencyCurrency = 'FOO'
  
  /*
    PART 1: CREATING ISSUED CURRENCY
  */
  console.log('****************************************************************************************************************\n')
  console.log('Part 1: Creating Issued Currency')
  
  console.log(`Building trustline from operational to issuer wallet...`)
  console.log(`- Trust Extender (operational wallet): ${customerWallet1.getAddress()}`)
  console.log(`- Issuer: ${issuerWallet.getAddress()}`)
  console.log(`- Amount: ${customerTrustLineLimit1} ${issuedCurrencyCurrency}\n`)

  const customerTrustLineResult1 = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    customerTrustLineLimit1,
    customerWallet1,
  )
  console.log(customerTrustLineResult1)
  console.log("Result:", statusCodeToString(customerTrustLineResult1.status), '\n')

  const issuedCurrencyAmount = '100'

  console.log(`Creating Issued Currency...`)
  console.log(`Amount: ${issuedCurrencyAmount} ${issuedCurrencyCurrency}`)
  console.log(`Issuer: ${issuerWallet.getAddress()}`)
  console.log(`Issued to: ${customerWallet1.getAddress()}\n`)

  const issuedCurrencyResult = await issuedCurrencyClient.createIssuedCurrency(
    issuerWallet,
    customerWallet1.getAddress(),
    issuedCurrencyCurrency,
    issuedCurrencyAmount,
  )
  console.log(issuedCurrencyResult)
  console.log("Result:", statusCodeToString(issuedCurrencyResult.status), '\n')

  /*
    PART 2: SENDING ISSUED CURRENCY TO CUSTOMER
  */
  console.log('****************************************************************************************************************\n')
  console.log('Part 2: Sending Issued Currency to Another Customer')
  
  console.log('Enabling rippling on the issuer wallet (necessary for sending issued currency)...\n')
  
  const enableRipplingResult = await issuedCurrencyClient.enableRippling(issuerWallet)
  console.log(enableRipplingResult)
  console.log("Result:", statusCodeToString(enableRipplingResult.status), '\n')

  console.log('Creating a second customer wallet...')

  const customerWallet2 = await XRPTestUtils.randomWalletFromFaucet()
  console.log('Customer 2 Address:', customerWallet2.getAddress(), '\n')

  const customerTrustLineLimit2 = '100'
  
  console.log(`Building trustline from issuer to customer wallet...`)
  console.log(`- Trust Extender (customer wallet): ${customerWallet2.getAddress()}`)
  console.log(`- Issuer: ${issuerWallet.getAddress()}`)
  console.log(`- Amount: ${customerTrustLineLimit2} ${issuedCurrencyCurrency}\n`)
  
  const customerTrustLineResult2 = await issuedCurrencyClient.createTrustLine(
    issuerWallet.getAddress(),
    issuedCurrencyCurrency,
    customerTrustLineLimit2,
    customerWallet2,
  )
  console.log(customerTrustLineResult2)
  console.log("Result:", statusCodeToString(customerTrustLineResult2.status), '\n')

  const sendingAmount = '100'

  console.log(`Sending Issued Currency...`)
  console.log(`- Amount: ${sendingAmount} ${issuedCurrencyCurrency}`)
  console.log(`- Sender: ${customerWallet1.getAddress()}`)
  console.log(`- Destination: ${customerWallet2.getAddress()}\n`)
  
  const sendPaymentResult = await issuedCurrencyClient.sendIssuedCurrencyPayment(
    customerWallet1,
    customerWallet2.getAddress(),
    issuedCurrencyCurrency,
    issuerWallet.getAddress(),
    sendingAmount,
  )
  console.log(sendPaymentResult)
  console.log("Result:", statusCodeToString(sendPaymentResult.status), '\n')

  /*
    PART 3: REDEEMING ISSUED CURRENCY
  */
  console.log('****************************************************************************************************************\n')
  console.log('Part 3: Redeeming Issued Currency')

  const redeemAmount = '100'

  console.log('Redeeming customer\'s issued currency...')
  console.log(`- Redeemer: ${customerWallet2.getAddress()}`)
  console.log(`- Issuer: ${issuerWallet.getAddress()}`)
  console.log(`- Amount: ${redeemAmount} ${issuedCurrencyCurrency}\n`)

  const redeemResult = await issuedCurrencyClient.redeemIssuedCurrency(
    customerWallet2,
    issuedCurrencyCurrency,
    issuerWallet.getAddress(),
    redeemAmount,
  )
  console.log(redeemResult)
  console.log("Result:", statusCodeToString(redeemResult.status), '\n')

  issuedCurrencyClient.webSocketNetworkClient.close()
}

function statusCodeToString(status) {
  switch (status) {
    case TransactionStatus.ClaimedCostOnly_PathDry:
      return "CLAIMED COST, PATH DRY"
    case TransactionStatus.ClaimedCostOnly_PathPartial:
      return "CLAIMED COST, PATH PARTIAL"
    case TransactionStatus.ClaimedCostOnly:
      return "CLAIMED COST"
    case TransactionStatus.MalformedTransaction:
      return "INVALID, MALFORMED TRANSACTION"
    case TransactionStatus.Failed:
      return "FAILED"
    case TransactionStatus.Pending:
      return "PENDING"
    case TransactionStatus.Succeeded:
      return "SUCCEEDED"
    case TransactionStatus.LastLedgerSequenceExpired:
      return "LAST LEDGER SEQUENCE EXPIRED"
    case TransactionStatus.Unknown:
    default:
      return "UNKNOWN"
  }
}

// Exit with an error code if there is an error. 
process.on('unhandledRejection', error => {
  console.log(`Fatal: ${error}`)
  process.exit(1)
});

main()
