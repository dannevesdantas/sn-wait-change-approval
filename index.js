const core = require('@actions/core');
const axios = require('axios');

var server;
var sysId;
var username;
var password;
var intervalMinutes;

try {
    server = core.getInput('server');
    sysId = core.getInput('sys_id');
    username = core.getInput('username');
    password = core.getInput('password');
    intervalMinutes = core.getInput('interval');
} catch (error) {
    core.setFailed(error.message);
}

verificarAprovacaoChange(sysId);

function verificarAprovacaoChange(sysId) {

    console.log('Verificando se a change já foi aprovada...');

    axios({
        method: 'get',
        url: `${server}/api/now/table/change_request?sysparm_query=sys_id=${sysId}&sysparm_display_value=True&sysparm_input_display_value=True`,
        auth: {
            username: username,
            password: password
        },
        headers: {
            'Accept': 'application/json'
        }
    }).then(function (response) {
        //console.log(JSON.stringify(response.data));
        console.log(`Mudança está no status: ${response.data.result[0].approval}`);

        var approvalStatus = response.data.result[0].approval;

        switch (approvalStatus) {
            case 'Approved':
                console.log('Mudança aprovada no ServiceNow!');
                break;
            case 'Rejected':
                core.setFailed('Mudança rejeitada no ServiceNow.');
                break;
            default:
                console.log('Mudança ainda não foi aprovada. Verificando novamente em alguns minutos.');
                setTimeout(function () { verificarAprovacaoChange(sysId); }, intervalMinutes * 60000);
        }

    }).catch(function (error) {
        setTimeout(function () { verificarAprovacaoChange(sysId); }, intervalMinutes * 60000);
    });

}
