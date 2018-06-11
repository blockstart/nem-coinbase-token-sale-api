import { createTransport, SentMessageInfo } from 'nodemailer';

const emailCreds = require('./emailCreds.json');

export interface Email {
	to: string;
	subject: string;
	html: string;
}

export interface EmailAttachment {
	to: string;
	bcc?: string;
	subject: string;
	html: string;
	attachments: Array<Attachment>;
}

export interface Attachment {filename: string; path: string; cid: string; }

export const mailTransport: any =  {
	service: 'Gmail',
	auth: {
		type: 'OAuth2',
		user: emailCreds.kycEmail.user,
		clientId: emailCreds.kycEmail.clientId,
		clientSecret: emailCreds.kycEmail.clientSecret,
		refreshToken: emailCreds.kycEmail.refreshToken
	}
};

export const sendEmail = async (mailOptions: Email): Promise<SentMessageInfo> => {
	return createTransport(mailTransport).sendMail(mailOptions);
};

export const sendKYCEmail = async (mailOptions: EmailAttachment): Promise<SentMessageInfo> => {
	return createTransport(mailTransport).sendMail(mailOptions);
};
