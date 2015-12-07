/*
 * grunt-pull-request
 * https://github.com/hoangnm284/grunt-pull-request
 *
 * Copyright (c) 2015 Hoang nguyen
 * Licensed under the MIT license.
 */

 'use strict';

(function() {
    /*
     * Github API: OAuth and Pull Request
     * API Docs: https://developer.github.com/v3/
     * Package: https://www.npmjs.com/package/github
     */
    // Github require
    var GitHubApi = require("github");

    var DEFAULT = {
        repo: process.env.GIT_REPO,
        user: process.env.GIT_USER,
        token: process.env.GIT_TOKEN,
        protocol: "https",
        host: "api.github.com",
        pathPrefix: "/api/v3",
        timeout: 5000
    };

    var DEFAULT_BASE = 'master';
    var DEFAULT_BODY = 'Pull request content';

    module.exports = function(grunt) {

        grunt.registerMultiTask('pull_request', 'Create pull request for github repo', function() {

            // Merge task-specific and/or target-specific options with these defaults.
            var options = this.options(DEFAULT);
            var done = null;

            function finished() {
                grunt.log.ok("Grunt pull request finish");
                if (done) {
                    done();
                    done = null;
                }
            };

            function getCurrentBranchName(callback) {
                grunt.log.writeln('Getting current branch name ....');
                grunt.util.spawn({
                    cmd: 'git',
                    args: ['symbolic-ref', 'HEAD', '--short']
                }, function(error, result) {
                    if (error) {
                        grunt.fail.warn([error]);
                        return false;
                    }
                    grunt.log.ok('Branch name: ' + result.stdout);
                    callback(result.stdout);
                    return result.stdout;
                });
            }

            function createPullRequest(headBranch){
                options.head = headBranch;
                options.base = options.base || DEFAULT_BASE;
                options.title = options.title || options.head + " to " + options.base;
                options.body = options.body || DEFAULT_BODY;

                try {
                    grunt.log.writeln('Creating pull request for ' + options.repo.cyan);
                    grunt.log.writeln(' From branch: ' + options.head.cyan);
                    grunt.log.writeln(' To branch: ' + options.base.cyan);
                    grunt.log.writeln(' By User: ' + options.user.cyan);
                    grunt.log.writeln(' Pullrequest Title: ' + options.title.green);
                    grunt.log.writeln(' Pullrequest Body: ' + options.body.green);
                    // Github pull-request
                    github.pullRequests.create({
                        "user": options.user,
                        "repo": options.repo,
                        "title": options.title,
                        "body": options.body,
                        "base": options.base,
                        "head": options.head
                    }, function(msg) {
                        if (msg) {
                            grunt.log.writeln('Message: ' + msg);
                        }
                        finished();
                    });
                } catch (err) {
                    grunt.fail.warn('Error: ' + err);
                    finished();
                }

            }

            // Github API instance
            var github = new GitHubApi({
                version: "3.0.0",
                debug: options.debug || false,
                protocol: options.protocol,
                host: options.host,
                pathPrefix: options.pathPrefix,
                timeout: options.timeout
            });

            // Github authentification
            github.authenticate({
                type: "oauth",
                token: options.token
            });

            done = grunt.task.current.async();

            // if head branch is not specified then we will get current branch name
            if (!options.head || options.head == ''){
                getCurrentBranchName(createPullRequest);
            } else {
                createPullRequest(options.head);
            }

        });

    };
})();
