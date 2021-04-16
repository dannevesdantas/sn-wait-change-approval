const core = require('@actions/core');
const axios = require('axios');

var server;
var sysId;
var statusField;
var statusToCheckFor;
var username;
var password;
var pollingInterval;

try {
    server = core.getInput('server');
    sysId = core.getInput('sys_id');
    statusField = core.getInput('status_field');
    statusToCheckFor = core.getInput('status_to_check_for');
    username = core.getInput('username');
    password = core.getInput('password');
    pollingInterval = core.getInput('polling_interval');
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
        console.log(`status_field: ${statusField}`);
        console.log(`status_to_check_for: ${statusToCheckFor}`);
        console.log(`camparação: ` + response.data.result[0][statusFiel] == statusToCheckFor);

        if (response.data.result[0][statusFiel] == statusToCheckFor) {
            console.log('Mudança aprovada no ServiceNow!');
        }

        // switch (approvalStatus) {
        //     case 'Approved':
        //         console.log('Mudança aprovada no ServiceNow!');
        //         break;
        //     case 'Rejected':
        //         core.setFailed('Mudança rejeitada no ServiceNow.');
        //         break;
        //     default:
        //         console.log('Mudança ainda não foi aprovada. Verificando novamente em alguns segundos.');
        //         setTimeout(function () { verificarAprovacaoChange(sysId); }, pollingInterval * 1000);
        // }

    }).catch(function (error) {
        setTimeout(function () { verificarAprovacaoChange(sysId); }, pollingInterval * 1000);
    });

}
