function renderStep(step, options) {
  const config = getConfig()
  options = options || {}
  const steps = [
    {
      name: 'configure',
      title: 'Device Flow Playground',
      description:
        'Configure the playground with your device application, OCI tenancy, and scopes.'
    },
    {
      name: 'authorize',
      screenId: 'authorize-screen',
      title: 'Authorization Request',
      description:
        'In this step, the user would like to start streaming content from AuthU TV on their smart TV. Typically, they would trigger some action on their TV, like installing an AuthU TV app, and would be presented with a screen that may look as follows. Once the user hits the <b>Authorize</b> button, they will initiate a device authorization transaction via the <code>/oauth2/v1/device</code> endpoint on their tenant.'
    },
    {
      name: 'exchange',
      screenId: 'exchange-screen',
      title: 'Token Request',
      description:
        "In this step, the user is prompted to authorize the device by navigating to the tenant's <code>/ui/v1/device</code> endpoint, or alternatively by scanning the QR code, and entering the user code displayed on the smart TV. In the background, the smart TV is polling the tenant's <code>/oauth2/v1/token</code> endpoint to exchange the device code for an access token and, optionally, a refresh token."
    },
    {
      name: 'complete',
      screenId: 'complete-screen',
      title: 'Activation Complete',
      description:
        'The user has successfully authorized the device and can begin streaming content from AuthU TV on their smart TV. A call to the <code>/userinfo</code> endpoint is made to fetch additional information about the user to customize their UI.'
    }
  ]
  let currentStepIdx = 0
  let currentStep = steps[currentStepIdx]

  for (currentStepIdx; currentStepIdx < steps.length; currentStepIdx++) {
    if (steps[currentStepIdx].name === step) {
      currentStep = steps[currentStepIdx]
      break
    }
  }

  renderHeader(currentStep, currentStepIdx)

  if (step === 'authorize') {
    const config = getConfig()
    let reqBody = {
      client_id: config.clientId
    }

    // if (config.audience) {
    //   reqBody.audience = config.audience
    // }

    if (config.scopes.length) {
      reqBody.scope = config.scopes.join(' ')
    }

    renderScreen(currentStep.screenId)
    renderReqRes(
      'Authorization Request',
      'Sample Authorization Response',
      generateCurlRequest(
        '/oauth2/v1/device',
        'POST',
        ['Content-Type: application/x-www-form-urlencoded'],
        reqBody
      ),
      JSON.stringify(
        {
          device_code: '6833db68bfbf48eebc4138d189cb073a',
          user_code: 'QTZLMCBW',
          verification_uri: `https://${config.tenant}/ui/v1/device`,
          expires_in: 300
        },
        null,
        10
      )
    )
  }

  if (step === 'exchange') {
    renderScreen(currentStep.screenId)
    renderReqRes(
      'Exchange Request',
      '',
      generateCurlRequest(
        '/oauth2/v1/token',
        'POST',
        ['Content-Type: application/x-www-form-urlencoded'],
        {
          client_id: getConfig().clientId,
          device_code: options.deviceCode.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        }
      ),
      ''
    )

    new QRCode(document.getElementById('qrcode'), {
      text: options.deviceCode.verification_uri,
      colorDark: '#222228',
      colorLight: '#D0D2D3',
      height: 200,
      width: 200
    })

    document.getElementById('user-code').innerText =
      options.deviceCode.user_code
    document.getElementById('tenant-activation-link').innerText = `${
      config.tenant
    }/ui/v1/device`
    document.getElementById('tenant-activation-link').href = `https://${
      config.tenant
    }/ui/v1/device`
  }

  if (step === 'complete') {
    renderScreen(currentStep.screenId)
    renderReqRes(
      '<code>/userinfo</code> Request',
      '<code>/userinfo</code> Response',
      generateCurlRequest(
        '/userinfo',
        'GET',
        [`Authorization: Bearer ${options.tokenSet.access_token}`],
        null
      ),
      JSON.stringify(options.userInfo, null, 2)
    )
    renderTokenSetResponse(options.tokenSet)

    document.querySelector('#complete-screen h1').textContent = `Welcome${
      options.userInfo && options.userInfo.name
        ? ', ' + options.userInfo.name
        : ''
    }!`
  }

  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block)
  })
}

function setExchangeResponse(response) {
  document.querySelector(
    '#response h4'
  ).textContent = `Exchange Response - Updated: ${new Date().toLocaleTimeString()}`
  document.querySelector('#response pre code').textContent = JSON.stringify(
    response,
    null,
    10
  )
  hljs.highlightBlock(document.querySelector('#response pre code'))
}

function renderScreen(screenId) {
  document.getElementById('tv-container').style.display = 'block'
  document
    .querySelectorAll('.screen')
    .forEach((el) => (el.style.display = 'none'))
  document.getElementById(screenId).style.display = 'block'
}

function renderHeader(step, stepIdx) {
  document.getElementById('step-title').innerText = step.title
  document.getElementById('step-description').innerHTML = step.description

  document.querySelectorAll('.step-number').forEach((el, idx) => {
    if (idx === stepIdx) {
      el.classList.add('active')
    } else {
      el.classList.remove('active')
    }
  })
}

function renderReqRes(reqTitle, resTitle, reqBody, resBody) {
  document.getElementById('request').style.display = 'block'
  document.getElementById('response').style.display = 'block'
  document.querySelector('#request h4').innerHTML = reqTitle
  document.querySelector('#response h4').innerHTML = resTitle
  document.querySelector('#request pre code').textContent = reqBody
  document.querySelector('#response pre code').textContent = resBody
}

function renderTokenSetResponse(tokenSet) {
  document.getElementById('token-set').style.display = 'block'
  document.querySelector('#token-set pre code').textContent = JSON.stringify(
    tokenSet,
    null,
    10
  )
}

function generateCurlRequest(endpoint, method, headers, data) {
  const NEW_LINE = ' \\\n     '
  const url = `https://${getConfig().tenant}${endpoint}`
  const dataString = data ? `-d "${new URLSearchParams(data)}"` : ''
  method = method === 'POST' ? '-X POST ' : ''

  return `curl ${method}${url}${NEW_LINE}${headers
    .map((h) => `-H "${h}"`)
    .join(' ')}${data ? NEW_LINE : ''}${dataString}`
}

function getConfig() {
  const tenant = document.getElementById('tenant-input').value
  const clientId = document.getElementById('client-id-input').value
  let scopes = []

  document
    .querySelectorAll('input.scope-input:checked')
    .forEach((el) => scopes.push(el.value))

  return {
    tenant,
    clientId,
    scopes
  }
}
