const inquirer = require('./inquirer');
const shell = require('shelljs');

module.exports = {
    createProject: async () => {
        const answers = await inquirer.askProjectDetails();
        shell.exec(`ng new ${answers.name} --directory ./`);
        return answers;
    }
};