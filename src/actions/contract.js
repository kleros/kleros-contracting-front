// Actions
export const FETCH_CONTRACT = 'FETCH_CONTRACT'
export const CREATE_CONTRACT = 'CREATE_CONTRACT'
export const RECEIVE_CONTRACT = 'RECEIVE_CONTRACT'
export const FETCH_CONTRACTS = 'FETCH_CONTRACTS'
export const RECEIVE_CONTRACTS = 'RECEIVE_CONTRACTS'
export const FETCH_GETDISPUTE = 'FETCH_GETDISPUTE'
export const CREATE_DISPUTE = 'CREATE_DISPUTE'
export const RECEIVE_DISPUTE = 'RECEIVE_DISPUTE'
export const CREATE_APPEAL = 'CREATE_APPEAL'
export const RECEIVE_APPEAL = 'RECEIVE_APPEAL'
export const FETCH_CANAPPEAL = 'FETCH_CANAPPEAL'
export const RECEIVE_CANAPPEAL = 'RECEIVE_CANAPPEAL'
export const CREATE_PAY = 'CREATE_PAY'
export const RECEIVE_PAY = 'RECEIVE_PAY'
export const CREATE_REIMBURSE = 'CREATE_REIMBURSE'
export const RECEIVE_REIMBURSE = 'RECEIVE_REIMBURSE'
export const CREATE_EVIDENCE = 'CREATE_EVIDENCE'
export const RECEIVE_EVIDENCE = 'RECEIVE_EVIDENCE'
export const CREATE_TIMEOUT = 'CREATE_TIMEOUT'
export const RECEIVE_TIMEOUT = 'RECEIVE_TIMEOUT'
export const FETCH_CURRENT_RULING_FOR_DISPUTE =
  'FETCH_CURRENT_RULING_FOR_DISPUTE'
export const RECEIVE_CURRENT_RULING_FOR_DISPUTE =
  'RECEIVE_CURRENT_RULING_FOR_DISPUTE'

// Action Creators
export const createContract = contract => ({
  type: CREATE_CONTRACT,
  payload: { contract }
})
export const fetchContracts = () => ({ type: FETCH_CONTRACTS })
export const receiveContracts = contracts => ({
  type: RECEIVE_CONTRACTS,
  payload: { contracts }
})
export const fetchContract = contractAddress => ({
  type: FETCH_CONTRACT,
  payload: { contractAddress }
})
export const receiveContract = contract => ({
  type: RECEIVE_CONTRACT,
  payload: { contract }
})
export const fetchGetDispute = (contractAddress, disputeId) => ({
  type: FETCH_GETDISPUTE,
  payload: { contractAddress, disputeId }
})
export const createDispute = contractAddress => ({
  type: CREATE_DISPUTE,
  payload: { contractAddress }
})
/*
  the dispute param can be a hash if it's a new dispute
  or an object if the dispute exists
  maybe use RECEIVE_CREATED_
*/
export const receiveDispute = dispute => ({
  type: RECEIVE_DISPUTE,
  payload: { dispute }
})
export const createAppeal = contractAddress => ({
  type: CREATE_APPEAL,
  payload: { contractAddress }
})
export const receiveAppeal = appealTx => ({
  type: RECEIVE_APPEAL,
  payload: { appealTx }
})
export const fetchCanAppeal = (contractAddress, disputeId) => ({
  type: FETCH_CANAPPEAL,
  payload: { contractAddress, disputeId }
})
export const receiveCanAppeal = canAppeal => ({
  type: RECEIVE_CANAPPEAL,
  payload: { canAppeal }
})

export const createPay = (contractAddress, partyA, partyB) => ({
  type: CREATE_PAY,
  payload: { contractAddress, partyA, partyB }
})
export const receivePay = disputeTx => ({
  type: RECEIVE_PAY,
  payload: { disputeTx }
})
export const createReimburse = (contractAddress, partyA, partyB) => ({
  type: CREATE_REIMBURSE,
  payload: { contractAddress, partyA, partyB }
})
export const receiveReimburse = reimburse => ({
  type: RECEIVE_REIMBURSE,
  payload: { reimburse }
})
export const createEvidence = evidence => ({
  type: CREATE_EVIDENCE,
  payload: { evidence }
})
export const receiveEvidence = evidence => ({
  type: RECEIVE_EVIDENCE,
  payload: { evidence }
})
export const createTimeout = (contractAddress, partyA, partyB) => ({
  type: CREATE_TIMEOUT,
  payload: { contractAddress, partyA, partyB }
})
export const receiveTimeout = timeout => ({
  type: RECEIVE_TIMEOUT,
  payload: { timeout }
})
export const fetchCurrentRulingForDispute = (disputeId, appeal) => ({
  type: FETCH_CURRENT_RULING_FOR_DISPUTE,
  payload: { disputeId, appeal }
})
export const receiveCurrentRulingForDispute = ruling => ({
  type: RECEIVE_CURRENT_RULING_FOR_DISPUTE,
  payload: { ruling }
})
