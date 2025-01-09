import axios from 'axios'
import { connection, logConnection } from './providers/solana'
import { UserPlan } from './lib/user-plan'
import { ValidTransactions } from './lib/valid-transactions'
import { TokenUtils } from './lib/token-utils'
import { Logs, PublicKey } from '@solana/web3.js'
import {
  JUPITER_PROGRAM_ID,
  PUMP_FUN_PROGRAM_ID,
  PUMP_FUN_TOKEN_MINT_AUTH,
  RAYDIUM_PROGRAM_ID,
} from './config/program-ids'
import { SwapType } from './types/swap-types'
import chalk from 'chalk'

function isRelevantTransaction(logs: Logs): { isRelevant: boolean; program: SwapType } {
  // Guard clause for empty logs
  if (!logs.logs || logs.logs.length === 0) {
    return { isRelevant: false, program: null }
  }

  // Join logs into a single string for searching
  const logString = logs.logs.join(' ')

  // Check programs one by one and return the first match
  if (logString.includes(PUMP_FUN_PROGRAM_ID)) {
    return { isRelevant: true, program: 'pumpfun' }
  }
  if (logString.includes(RAYDIUM_PROGRAM_ID)) {
    return { isRelevant: true, program: 'raydium' }
  }
  if (logString.includes(JUPITER_PROGRAM_ID)) {
    return { isRelevant: true, program: 'jupiter' }
  }
  if (logString.includes(PUMP_FUN_TOKEN_MINT_AUTH)) {
    return { isRelevant: true, program: 'mint_pumpfun' }
  }

  return { isRelevant: false, program: null }
}

const programIds = [PUMP_FUN_PROGRAM_ID, RAYDIUM_PROGRAM_ID, JUPITER_PROGRAM_ID]

export const test2 = async () => {
  const walletAddresses = [
    'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj',
    'AsX67niuMc9F91tQFeHvHiUEAnXwam4VoHTbRZ84935W',
    'JDWmTTSZv2wkRkRKkeXa44j8Q7M4SW3XFMwYYBf7hwdi',
  ]

  for (const walletAddress of walletAddresses) {
    const publicKey = new PublicKey(walletAddress)
    console.log('watching transactions for: ', publicKey.toBase58())

    const subscriptionId = logConnection.onLogs(
      publicKey,
      async (logs, ctx) => {
        const { isRelevant, program } = isRelevantTransaction(logs)

        if (!isRelevant) {
          console.log(chalk.redBright('NO RELEVANT', logs.signature))
          return
        }

        console.log(chalk.greenBright('YES ITS RELEVANT', logs.signature))
        console.log('Program:', program)
      },
      'processed',
    )
  }
}

export const parseTransactions = async () => {
  try {
    const transactionDetails = await connection.getTransaction(
      '28AFNwYFCdQTW5suiEr4b6Cj9hmWiGGoPkiNi2MJU8Y7S3G1YzCs8LHq91U37shCEAx1ZWA8jjPugMLGYEjUr5vU',
      {
        maxSupportedTransactionVersion: 0,
      },
    )

    console.log(transactionDetails)
    return transactionDetails
  } catch (error) {
    console.log('GET_PARSED_TRANSACTIONS_ERROR', error)
    return
  }
}

parseTransactions()
// test2()
