import unit from 'ethjs-unit'
import { push } from 'react-router-redux'
import { call, put, takeLatest } from 'redux-saga/effects'
import { toastr } from 'react-redux-toastr'

import kleros, { eth } from '../bootstrap/dapp-api'
import * as contractActions from '../actions/contract'
import { ETH_NO_ACCOUNTS } from '../constants/errors'

const toastrOptions = {
  timeOut: 3000,
  showCloseButton: false
}

/**
 * Creates a new contract.
 * @param {object} { payload: contract } - The contract to create.
 */
function* createContract({ type, payload: { contract } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  yield put(push('/'))

  let newContract = null

  try {
    newContract = yield call(
      kleros.arbitrableContract.deployContract,
      accounts[0].toLowerCase(),
      unit.toWei(contract.payment, 'ether'),
      contract.description,
      process.env.REACT_APP_ARBITRATOR_ADDRESS_DEV,
      process.env.REACT_APP_ARBITRATOR_TIMEOUT,
      contract.partyB.toLowerCase(),
      process.env.REACT_APP_ARBITRATOR_EXTRADATA,
      contract.email,
      contract.title,
      contract.description
    )
  } catch (err) {
    console.log(err)
  }

  yield put(contractActions.receiveContract(newContract))
}

/**
 * Fetches contracts for the current user and puts them in the store.
 */
function* fetchContracts() {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  let contracts = []

  contracts = yield call(
    kleros.arbitrator.getContractsForUser,
    accounts[0].toLowerCase()
  )

  yield put(contractActions.receiveContracts(contracts.reverse()))
}

/**
 * Fetches contract details.
 * @param {object} { payload: contractAddress } - The address of the contract to fetch details for.
 */
function* fetchContract({ payload: { contractAddress } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  let contract = null

  try {
    contract = yield call(
      kleros.arbitrableContract.getData,
      contractAddress,
      accounts[0].toLowerCase()
    )
  } catch (err) {
    console.log(err)
  }

  yield put(contractActions.receiveContract(contract))
}

/**
 * Pay the party B. To be called when the good is delivered or the service rendered.
 * @param {object} { payload: contractAddress, partyA, partyB } - The address of the contract.
 */
function* createPay({ type, payload: { contractAddress, partyA, partyB } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  yield put(push('/'))

  let payTx = null

  try {
    if (partyA !== accounts[0]) throw new Error('The caller must be the partyA')

    const contract = yield call(
      kleros.arbitrableContract._ArbitrableContract.load,
      contractAddress
    )

    // TODO get the amount from the api
    const amount = yield call(contract.amount.call)

    if (amount.toNumber() === 0)
      throw new Error('The dispute is already finished')

    payTx = yield call(contract.pay, {
      from: accounts[0]
    })
  } catch (err) {
    console.log(err)
    toastr.error('Pay transaction failed', toastrOptions)
    throw new Error('Error pay transaction')
  }

  yield call(
    toastr.success,
    'Payment successful',
    toastrOptions
  )

  yield put(contractActions.receivePay(payTx))
}

/**
 * Reimburse party A. To be called if the good or service can't be fully provided.
 * @param {object} { payload: contractAddress } - The address of the contract.
 */
function* createReimburse({ type, payload: { contractAddress } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  yield put(push('/'))

  let reimburseTx = null

  try {
    const contract = yield call(
      kleros.arbitrableContract._ArbitrableContract.load,
      contractAddress
    )

    // TODO get the amount from the api
    const amount = yield call(contract.amount.call)

    if (amount.toNumber() === 0)
      throw new Error('The dispute is already finished')

    // TODO add fn reimburse in the api
    /**
    const reimburseTx = yield call(contract.reimburse, amount.Number(), {
      from: accounts[0]
    })
     */
  } catch (err) {
    console.log(err)
    toastr.error('Reimburse failed', toastrOptions)
    throw new Error('Error reimburse failed')
  }

  yield call(
    toastr.success,
    'Successful refund',
    toastrOptions
  )

  yield put(contractActions.receiveReimburse(reimburseTx))
}

/**
 * Raises dispute.
 * @param {object} { payload: contractAddress } - The address of the contract.
 */
function* createDispute({ type, payload: { contractAddress } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  let contract,
    disputeTx = null

  try {
    contract = yield call(kleros.arbitrableContract.getData, contractAddress)

    let fee
    if (contract.partyA === accounts[0]) fee = contract.partyAFee
    if (contract.partyB === accounts[0]) fee = contract.partyBFee

    const court = yield call(
      kleros.klerosPOC.load,
      process.env.REACT_APP_ARBITRATOR_ADDRESS_DEV
    )

    const arbitrationCost = yield call(
      court.arbitrationCost,
      contract.arbitratorExtraData
    )

    const cost = unit.fromWei(arbitrationCost.toNumber() - fee, 'ether')

    if (accounts[0] === contract.partyA) {
      disputeTx = yield call(
        kleros.disputes.raiseDisputePartyA,
        accounts[0],
        contractAddress,
        cost
      )
    } else if (accounts[0] === contract.partyB) {
      disputeTx = yield call(
        kleros.disputes.raiseDisputePartyB,
        accounts[0],
        contractAddress,
        cost
      )
    }
  } catch (err) {
    console.log(err)
    toastr.error('Create dispute failed', toastrOptions)
    throw new Error('Error create dispute failed')
  }

  yield put(push('/'))

  yield call(
    toastr.success,
    'Dispute creation successful',
    toastrOptions
  )

  yield put(contractActions.receiveDispute(disputeTx))
}

/**
 * Call by PartyA to be to reimburse if partyB fails to pay the fee.
 * @param {object} { payload: contractAddress, partyA, partyB } - The address of the contract.
 */
function* createTimeout({
  type,
  payload: { contractAddress, partyA, partyB }
}) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  yield put(push('/'))

  let timeoutTx = null

  try {
    const contract = yield call(
      kleros.arbitrableContract._ArbitrableContract.load,
      contractAddress
    )

    // TODO get the amount from the api
    const amount = yield call(contract.amount.call)

    if (amount.toNumber() === 0)
      throw new Error('The dispute is already finished')

    if (partyA === accounts[0]) {
      timeoutTx = yield call(contract.timeOutByPartyA, {
        from: accounts[0]
      })
    } else if (partyB === accounts[0]) {
      timeoutTx = yield call(contract.timeOutByPartyB, {
        from: accounts[0]
      })
    }
  } catch (err) {
    console.log(err)
    toastr.error('Timeout failed', toastrOptions)
    throw new Error('Error timeout failed')
  }

  yield call(
    toastr.success,
    'Timeout successful',
    toastrOptions
  )

  yield put(contractActions.receiveTimeout(timeoutTx))
}

/**
 * Send evidence
 * @param {object} { payload: evidence } - Evidence.
 */
function* createEvidence({ type, payload: { evidence } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  yield put(push('/'))

  let evidenceTx = null

  try {
    evidenceTx = yield call(
      kleros.arbitrableContract.submitEvidence,
      accounts[0],
      evidence.addressContract,
      evidence.name,
      evidence.description,
      evidence.url
    )

    // notification send evidence in waiting
  } catch (err) {
    console.log(err)
    toastr.error('Evidence creation failed', toastrOptions)
    throw new Error('Error evidence creation failed')
  }

  yield call(
    toastr.success,
    'Evidence creation successful',
    toastrOptions
  )

  yield put(contractActions.receiveEvidence(evidenceTx))
}

/**
 * Fetches dispute details.
 * @param {object} { payload: contractAddress, disouteId } - The address of the contract and the dispute id to fetch details for.
 */
function* fetchDispute({ payload: { contractAddress, disputeId } }) {
  const accounts = yield call(eth.accounts)
  if (!accounts[0]) throw new Error(ETH_NO_ACCOUNTS)

  let dispute = null

  try {
    dispute = yield call(
      kleros.klerosPOC.getDispute,
      process.env.REACT_APP_ARBITRATOR_ADDRESS_DEV,
      disputeId
    )
  } catch (err) {
    console.log(err)
  }

  yield put(contractActions.receiveGetdispute(dispute))
}

/**
 * The root of the wallet saga.
 * @export default walletSaga
 */
export default function* walletSaga() {
  yield takeLatest(contractActions.CREATE_CONTRACT, createContract)
  yield takeLatest(contractActions.FETCH_CONTRACTS, fetchContracts)
  yield takeLatest(contractActions.FETCH_CONTRACT, fetchContract)
  yield takeLatest(contractActions.CREATE_DISPUTE, createDispute)
  yield takeLatest(contractActions.FETCH_GETDISPUTE, fetchDispute)
  yield takeLatest(contractActions.CREATE_PAY, createPay)
  yield takeLatest(contractActions.CREATE_REIMBURSE, createReimburse)
  yield takeLatest(contractActions.CREATE_EVIDENCE, createEvidence)
  yield takeLatest(contractActions.CREATE_TIMEOUT, createTimeout)
}
