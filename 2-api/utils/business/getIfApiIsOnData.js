'use strict';

const {
    utils: {
        stringify,
        redis: {
            doRedisRequest,
            // getClient,
        },
        javascript: {
            jsonEncoder
        }
    },
    constants: {
        redis: {
            keys: {
                cacheOnAndOffStatus
            } 
        }
    }
} = require( '@bitcoin-api/full-stack-api' );

const timeUntilRhinoPondBecomesMurky = 5 * 60 * 1000;


const getApiIsOnData = Object.freeze( ({

    bitcoinAPIIsOn = false,
    bitcoinAPIIsOffReason = null,

}) => ({
    
    bitcoinAPIIsOn,
    bitcoinAPIIsOffReason,
}));


const getIfBankIsOn = Object.freeze( async ({

    redisClient

}) => {
    
    try {

        const cacheOnAndOffStatusRhinoPond = await doRedisRequest({
            client: redisClient,
            command: 'get',
            redisArguments: [
                cacheOnAndOffStatus,
            ]
        });

        if( !cacheOnAndOffStatusRhinoPond ) {

            throw new Error( 'no rhino pond for on and off status' );
        }

        const {

            bitcoinAPIIsOn,
            bitcoinAPIIsOffReason,
            rhinoTime,

        } = jsonEncoder.decodeJson( cacheOnAndOffStatusRhinoPond );

        console.log(`

            getIfApiIsOnData.getIfBankIsOn gotten values:
        
            ${ stringify({

                bitcoinAPIIsOn,
                bitcoinAPIIsOffReason,
                rhinoTime,
            })}
        `);

        const rhinoPondExpiry = (rhinoTime + timeUntilRhinoPondBecomesMurky);

        if( Date.now() > rhinoPondExpiry ) {

            throw new Error( 'expired rhino pond for on and off status' );
        }

        const apiIsOnData = getApiIsOnData({

            bitcoinAPIIsOn,
            bitcoinAPIIsOffReason,
        });

        return apiIsOnData;
    }
    catch( err ) {

        console.log( 'error in getIfBankIsOn:', err, '- ignoring error' );

        const apiIsOnData = getApiIsOnData({

            bitcoinAPIIsOn: false,
        });

        return apiIsOnData;
    }
});


module.exports = Object.freeze( async ({

    redisClient

}) => {

    console.log( 'running getIfApiIsOnData' );

    const apiIsOnData = await getIfBankIsOn({

        redisClient
    });

    console.log(
        'getIfApiIsOnData - executed successfully ' +
        `Api is on?: ${ stringify({ apiIsOnData }) }`
    );

    return apiIsOnData;
});
