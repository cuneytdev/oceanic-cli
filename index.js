#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const files = require('./lib/files');
const github = require('./lib/github');
const repo = require('./lib/repo');
const project = require('./lib/project');


clear();

console.log(
    chalk.yellow(
        figlet.textSync('Oceanic', { horizontalLayout: 'full' })
    )
);

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a Git repository!'));
    process.exit();
}

const getGithubToken = async () => {
    // Fetch token from config store
    let token = github.getStoredGithubToken();
    if (token) {
        return token;
    }

    // No token found, use credentials to access GitHub account
    token = await github.getPersonalAccesToken();
    return token;
};

const controlFlags = async (arguments) => {
    //flags that you want to control
    if (arguments['help']) {
        console.log(chalk.yellow('controlFlags => new => creates repo'));
    }
}

const controlParameters = async (parameters) => {
    //parameters that you want to control
    if (parameters.includes('new')) {
        const projectInformation = await project.createProject();
        return projectInformation;
    }
}

const run = async () => {
    try {
        // Retrieve & Set Authentication Token
        const token = await getGithubToken();
        github.githubAuth(token);
        const argv = require('minimist')(process.argv.slice(2));
        const length = Object.keys(argv).length;
        if (length <= 1 && argv._.length == 0) {
            console.log(
                chalk.green("Usage: oceanic <command>") + '\n' +
                chalk.green("where <command> is one of: ") + '\n' +
                chalk.green('\t' + "new, help, create")
            );
        }
        await controlFlags(argv);
        const project = await controlParameters(argv._);
        const url = await repo.createRemoteRepo(project);
        await repo.setupRepo(url);
    } catch (err) {
        if (err) {
            switch (err.status) {
                case 401:
                    console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
                    break;
                case 422:
                    console.log(chalk.red('There is already a remote repository or token with the same name'));
                    break;
                default:
                    console.log(chalk.red(err));
            }
        }
    }
};

run();