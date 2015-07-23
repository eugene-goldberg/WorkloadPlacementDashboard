'use strict';

module.exports = {
	db: 'mongodb://localhost/datamanager-03-test',
	app: {
		title: 'Workload Placement Dashboard'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'asdf',
		clientSecret: process.env.FACEBOOK_SECRET || 'asdf',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'asdf',
		clientSecret: process.env.TWITTER_SECRET || 'asdf',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'asdf',
		clientSecret: process.env.GOOGLE_SECRET || 'asdf',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'asdf',
		clientSecret: process.env.GITHUB_SECRET || 'asdf',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
