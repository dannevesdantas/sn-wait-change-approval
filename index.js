const core = require('@actions/core');
const axios = require('axios');

try {
    // `who-to-greet` input defined in action metadata file
    const instanceUrl = core.getInput('instance-url');
    //console.log(`Instance Url is ${instanceUrl}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

// teste Danilo

const instanceUrl = core.getInput('instance-url');
const sysId = core.getInput('sys_id');
const intervalMinutes = core.getInput('interval');

verificarAprovacaoChange(sysId);

function verificarAprovacaoChange(sysId) {

    console.log('Verificando se a change já foi aprovada...');

    axios({
        method: 'get',
        url: `${instanceUrl}/api/sn_chg_rest/change/${sysId}`,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic YWRtaW46ajZMdXNxbFUzVUNF'
        }
    }).then(function (response) {
        //console.log(JSON.stringify(response.data));
        console.log(`Mudança está no status: ${response.data.result.approval.display_value}`);

        var approvalStatus = response.data.result.approval.value;

        switch (approvalStatus) {
            case 'approved':
                console.log('Mudança aprovada no ServiceNow!');
            case 'rejected':
                console.log('Mudança rejeitada no ServiceNow.');
            case 'requested':
            default:
                console.log('Mudança ainda não foi aprovada. Verificando novamente em alguns minutos.');
                setTimeout(function () { verificarAprovacaoChange(sysId); }, intervalMinutes * 60000);
        }

    }).catch(function (error) {
        setTimeout(function () { verificarAprovacaoChange(sysId); }, intervalMinutes * 60000);
    });

}