/**
 * Sample response from `/oauth2/v1/device`:
 * {
 *   "device_code": "Ag_EEG_U-x5FGsQshfpzko1p",
 *   "user_code": "QTZL-MCBW",
 *   "verification_uri": "https://fadydev.auth0.com/ui/v1/device",
 *   "expires_in": 900
 * }
 */

/*
https://idcs-i68t1wl5ao2jar2yuwlh9jakzg0vec.identity.preprod.oraclecloud.com/oauth2/v1/authorize?client_id=83743ee4572e4b0d86fe3fe6c29f506e&response_type=code&redirect_uri=%2Fui%2Fv1%2Fmyconsole&scope=openid&state=1234

https://playground.identity.internal.oracle.com:8943/oauth2/v1/authorize?client_id=345637e117254f27aff562b26d9ba11d&response_type=code&redirect_uri=%2Fui%2Fv1%2Fmyconsole&scope=openid&state=1234
*/
function requestAuthorization() {
  const config = getConfig()
  let body = {
    client_id: config.clientId
  }

  // if (config.audience) {
  //   body.audience = config.audience
  // }

  if (config.scopes.length) {
    body.scope = config.scopes.join(' ')
  }

  body.response_type = "device_code"
  console.log(body)
  
  fetch(`https://${config.tenant}/oauth2/v1/device`, {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then((res) => res.json())
    .then((jsonRes) => {
      if (!jsonRes.error) {
        console.log(jsonRes)
        exchangeDeviceCodeForToken(jsonRes)
      } else {
        console.log(jsonRes)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

/**
 * Poll the `/oauth2/v1/token` endpoint to exchange the device code for tokens
 * after the user has successfully authorized the device.
 *
 * @param {Object} deviceCode
 */
function exchangeDeviceCodeForToken(deviceCode) {
  renderStep('exchange', { deviceCode })

  const execExchange = () => {
    const config = getConfig()

    fetch(`https://${config.tenant}/oauth2/v1/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: config.clientId,
        device_code: deviceCode.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((res) => res.json())
      .then((jsonRes) => {
        setExchangeResponse(jsonRes)

        if (!jsonRes.error) {
          fetchUserInfo(jsonRes)
        } else if (['authorization_pending', 'slow_down'].includes(jsonRes.error)) {
          setTimeout(
            execExchange,
            deviceCode.interval * 1000
          )
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  execExchange()
}

/**
 * Retrieve user info from the `/userinfo` endpoint using the `access_token`
 *
 * @param {Object} tokenSet
 */
function fetchUserInfo(tokenSet) {
  const config = getConfig()

  fetch(`https://${config.tenant}/oauth2/v1/userinfo`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${tokenSet.access_token}`
    }
  })
    .then((res) => res.json())
    .then((jsonRes) => {
      renderStep('complete', { tokenSet, userInfo: jsonRes })
    })
    .catch((err) => {
      console.log(err)
    })
}

// event handlers
document
  .getElementById('authorize-btn')
  .addEventListener('click', requestAuthorization)

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('configure-section').style.display = 'none'
  renderStep('authorize')
})

renderStep('configure')
