/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/attesto_program.json`.
 */
export type AttestoProgram = {
  "address": "EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk",
  "metadata": {
    "name": "attestoProgram",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "fileDispute",
      "docs": [
        "Called by whoever paid for a skill-check, to dispute the fulfillment",
        "receipt they received. One dispute per resource_id, enforced by PDA",
        "`init` — no separate nonce bookkeeping needed."
      ],
      "discriminator": [
        210,
        63,
        221,
        114,
        212,
        97,
        195,
        156
      ],
      "accounts": [
        {
          "name": "receipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
                  111,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "resourceId"
              }
            ]
          }
        },
        {
          "name": "dispute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
                  111,
                  95,
                  100,
                  105,
                  115,
                  112,
                  117,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "resourceId"
              }
            ]
          }
        },
        {
          "name": "disputer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "resourceId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "recordFulfillmentAttestation",
      "docs": [
        "Called by Attesto's server after it has independently verified, by",
        "reading the transaction straight off devnet RPC, that `payment_signature`",
        "is a confirmed SPL transfer of the exact quoted amount from `payer` to",
        "Attesto's receiving address. Mints a permanent, publicly resolvable",
        "receipt of what was returned for a given paid request."
      ],
      "discriminator": [
        87,
        251,
        225,
        166,
        38,
        201,
        191,
        132
      ],
      "accounts": [
        {
          "name": "receipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
                  111,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "resourceId"
              }
            ]
          }
        },
        {
          "name": "paymentMarker",
          "docs": [
            "Guards against one payment_signature backing more than one receipt.",
            "Seeded on payment_signature_hash (the caller-supplied SHA-256 of",
            "payment_signature — 64 bytes exceeds the 32-byte seed limit, and",
            "Anchor's IDL-build macro can't evaluate a hash() call inline in",
            "`seeds`, hence precomputing it) and `init`'d in this same instruction,",
            "so a second concurrent request reusing the same signature fails",
            "atomically here — see PaymentMarker's doc comment for why this",
            "replaces the old off-chain getProgramAccounts scan. The handler",
            "re-derives the hash itself and rejects a mismatch, so a caller can't",
            "desync the seed from the actual signature being recorded."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
                  111,
                  95,
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "paymentSignatureHash"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "resourceId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "payer",
          "type": "pubkey"
        },
        {
          "name": "checkedAddress",
          "type": "pubkey"
        },
        {
          "name": "score",
          "type": "u8"
        },
        {
          "name": "paymentSignature",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "paymentSignatureHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "dispute",
      "discriminator": [
        36,
        49,
        241,
        67,
        40,
        36,
        241,
        74
      ]
    },
    {
      "name": "fulfillmentReceipt",
      "discriminator": [
        175,
        44,
        33,
        15,
        243,
        114,
        23,
        50
      ]
    },
    {
      "name": "paymentMarker",
      "discriminator": [
        253,
        90,
        98,
        11,
        113,
        215,
        74,
        172
      ]
    }
  ],
  "events": [
    {
      "name": "disputeFiled",
      "discriminator": [
        201,
        119,
        206,
        64,
        219,
        44,
        249,
        153
      ]
    },
    {
      "name": "fulfillmentAttested",
      "discriminator": [
        197,
        30,
        117,
        96,
        115,
        29,
        55,
        100
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedIssuer",
      "msg": "Caller is not the authorized Attesto issuer"
    },
    {
      "code": 6001,
      "name": "invalidScore",
      "msg": "Score must be between 0 and 100"
    },
    {
      "code": 6002,
      "name": "unauthorizedDisputer",
      "msg": "Caller is not the original payer of this receipt"
    },
    {
      "code": 6003,
      "name": "alreadyDisputed",
      "msg": "This receipt has already been disputed"
    },
    {
      "code": 6004,
      "name": "reasonTooLong",
      "msg": "Dispute reason exceeds 200 bytes"
    },
    {
      "code": 6005,
      "name": "paymentHashMismatch",
      "msg": "payment_signature_hash does not match SHA-256(payment_signature)"
    }
  ],
  "types": [
    {
      "name": "dispute",
      "docs": [
        "A dispute filed by the original payer against one FulfillmentReceipt.",
        "Same replay guarantee as the receipt itself: seeded on resource_id, so",
        "`init` allows at most one dispute per paid request."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resourceId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "receipt",
            "type": "pubkey"
          },
          {
            "name": "disputer",
            "type": "pubkey"
          },
          {
            "name": "reason",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "disputeFiled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dispute",
            "type": "pubkey"
          },
          {
            "name": "receipt",
            "type": "pubkey"
          },
          {
            "name": "resourceId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "disputer",
            "type": "pubkey"
          },
          {
            "name": "reason",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "fulfillmentAttested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "receipt",
            "type": "pubkey"
          },
          {
            "name": "resourceId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "checkedAddress",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u8"
          },
          {
            "name": "paymentSignature",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "fulfillmentReceipt",
      "docs": [
        "One paid GET /v1/skill-check request, settled and attested on-chain.",
        "",
        "The `resource_id` seed is what makes replay impossible: Anchor's `init`",
        "constraint fails outright if this PDA already exists, so the same",
        "single-use resource_id issued in a 402 challenge can back at most one",
        "attestation, full stop — no signature-reuse window like the one",
        "documented in prova_program's record_attestations (that gap is about",
        "Ed25519 message replay across transactions; this account never verifies",
        "an Ed25519 signature at all, it just refuses to be created twice)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "resourceId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "checkedAddress",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u8"
          },
          {
            "name": "paymentSignature",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "disputed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "paymentMarker",
      "docs": [
        "Marks one payment_signature as already spent, atomically alongside the",
        "FulfillmentReceipt it backs. Seeded on hash(payment_signature) rather than",
        "FulfillmentReceipt's own resource_id seed, so a single confirmed payment",
        "can never back two different receipts even under concurrent requests: the",
        "second `init` of this PDA fails outright, same atomicity guarantee that",
        "already protects against resource_id reuse, closing the read-then-write",
        "window the old off-chain getProgramAccounts scan (attesto-program.ts's",
        "findReceiptByPaymentSignature) could not."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
