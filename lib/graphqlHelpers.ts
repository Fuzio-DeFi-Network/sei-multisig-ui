import axios from 'axios';
import { DbAccount, DbSignature, DbTransaction } from '../types';

// Graphql base request for Faunadb
const graphqlReq = axios.create({
  // The fallback URL works for classic databases. See https://docs.fauna.com/fauna/current/learn/understanding/region_groups
  // for more information about regions.
  baseURL: process.env.FAUNADB_URL || 'https://graphql.fauna.com/graphql',
  headers: {
    Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
  },
});

/**
 * Creates multisig record in faunadb
 *
 * @param {object} multisig an object with address (string), pubkey JSON and chainId
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createMultisig = async (multisig: DbAccount) => {
  console.log(multisig);
  return graphqlReq({
    data: {
      query: `
        mutation {
          createMultisig(data: {
            address: "${multisig.address}"
            pubkeyJSON: ${JSON.stringify(multisig.pubkeyJSON)}
            chainId: "${multisig.chainId}"
          }) {
            _id
            address
            chainId
          }
        }
      `,
    },
    method: 'POST',
  });
};

/**
 * Gets multisig pubkey from faundb
 *
 * @param {string} address A multisig address.
 * @param {string} chainId The chainId the multisig belongs to.
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const getMultisig = async (address: string, chainId: string) => {
  return graphqlReq({
    data: {
      query: `
        query {
          getMultisig(address: "${address}", chainId: "${chainId}",) {
            address
            pubkeyJSON
            chainId
          }
        }
      `,
    },
    method: 'POST',
  });
};

/**
 * Creates transaction record in faunadb
 *
 * @param {object} transaction The base transaction
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createTransaction = async (transaction: DbTransaction) => {
  return graphqlReq({
    data: {
      query: `
        mutation {
          createTransaction(data: {dataJSON: ${JSON.stringify(transaction)}}) {
            _id
          }
        }
      `,
    },
    method: 'POST',
  });
};

/**
 * Retrieves a transaction from faunadb
 *
 * @param {string} id Faunadb resource id
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const findTransactionByID = async (id: string) => {
  return graphqlReq({
    data: {
      query: `
        query {
          findTransactionByID(id: "${id}") {
            _id
            dataJSON
            txHash
            signatures {
              data {
                address
                signature
                bodyBytes
              }
            }
          }
        }
      `,
    },
    method: 'POST',
  });
};

/**
 * Updates txHash of transaction on FaunaDB
 *
 * @param {string} id Faunadb resource id
 * @param {string} txHash tx hash returned from broadcasting a tx
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const updateTxHash = async (id: string, txHash: string) => {
  return graphqlReq({
    data: {
      query: `
        mutation {
          updateTransaction(id: ${id}, data: {txHash: "${txHash}"}) {
            _id
            dataJSON
            txHash
            signatures {
              data {
                address
                signature
                bodyBytes
              }
            }
          }
        }
      `,
    },
    method: 'POST',
  });
};

/**
 * Creates signature record in faunadb
 *
 * @param {object} signature an object with bodyBytes (string) and signature set (Uint8 Array)
 * @param {string} transactionId id of the transaction to relate the signature with
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createSignature = async (
  signature: DbSignature,
  transactionId: string,
) => {
  return graphqlReq({
    data: {
      query: `
        mutation {
          createSignature(data: {
            transaction: {connect: ${transactionId}}, 
            bodyBytes: "${signature.bodyBytes}",
            signature: "${signature.signature}",
            address: "${signature.address}" 
          }) {
            _id
            address
            signature
            address
          }
        }
      `,
    },
    method: 'POST',
  });
};

export {
  createMultisig,
  getMultisig,
  createTransaction,
  findTransactionByID,
  updateTxHash,
  createSignature,
};
