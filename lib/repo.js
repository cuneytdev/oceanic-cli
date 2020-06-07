const CLI = require('clui');
const fs = require('fs');
const git = require('simple-git/promise')();
const Spinner = CLI.Spinner;
const touch = require("touch");
const _ = require('lodash');

const inquirer = require('./inquirer');
const gh = require('./github');

module.exports = {
    createRemoteRepo: async (project) => {
        const github = gh.getInstance();
        const data = {
            name: project.name,
            description: project.description,
            private: 'public'
        };
        const status = new Spinner('Creating remote repository...');
        status.start();
        try {
            const response = await github.repos.createForAuthenticatedUser(data);
            return response.data.ssh_url;
        } finally {
            status.stop();
        }
    },

    createGitignore: async () => {
        const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

        if (filelist.length) {
            const answers = await inquirer.askIgnoreFiles(filelist);

            if (answers.ignore.length) {
                fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
            } else {
                touch('.gitignore');
            }
        } else {
            touch('.gitignore');
        }
    },

    setupRepo: async (url) => {
        const status = new Spinner('Initializing local repository and pushing to remote...');
        status.start();
        await git.add('./*')
        await git.commit('Initial commit')
        await git.addRemote('origin', url)
        await git.push('origin', 'master')
        status.stop();
    }
};