const core = require('@actions/core');
const axios = require('axios');

var server;
var sysId;
var tableName;
var statusField;
var statusToCheckFor;
var finishedStatus;
var abortedStatus;
var username;
var password;
var pollingInterval;
var timeout;

try {
    server = core.getInput('server');
    sysId = core.getInput('sys_id');
    tableName = core.getInput('table_name');
    statusField = core.getInput('status_field');
    statusToCheckFor = core.getInput('status_to_check_for');
    finishedStatus = core.getInput('finished_status');
    abortedStatus = core.getInput('aborted_status');
    username = core.getInput('username');
    password = core.getInput('password');
    pollingInterval = core.getInput('polling_interval');
    timeout = core.getInput('timeout');
} catch (error) {
    core.setFailed(error.message);
}

verificarAprovacaoChange(sysId);

function verificarAprovacaoChange(sysId) {

    console.log('Verificando se a change já foi aprovada...');

    axios({
        method: 'get',
        url: `${server}/api/now/table/${tableName}?sysparm_query=sys_id=${sysId}&sysparm_display_value=True&sysparm_input_display_value=True`,
        auth: { username: username, password: password },
        headers: { 'Accept': 'application/json' },
        timeout: timeout
    }).then(function (response) {
        //console.log(JSON.stringify(response.data));

        console.log(`Found [${response.data.result[0]["number"]}] in Service Now with field value: [${response.data.result[0][statusField]}] Looking for [${statusToCheckFor}]`);

        if (response.data.result[0][statusField] == statusToCheckFor) {
            console.log('Mudança aprovada no ServiceNow!');
        } else if (response.data.result[0][statusField] == finishedStatus) {
            console.log('Mudança aprovada no ServiceNow!');
            // Não precisa encerrar change
        } else if (response.data.result[0][statusField] == abortedStatus) {
            core.setFailed('Mudança foi abortada no ServiceNow.');
        } else {
            console.log('Mudança ainda não foi aprovada. Verificando novamente em alguns segundos.');
            setTimeout(function () { verificarAprovacaoChange(sysId); }, pollingInterval * 1000);
        }

    }).catch(function (error) {
        setTimeout(function () { verificarAprovacaoChange(sysId); }, pollingInterval * 1000);
    });

}
