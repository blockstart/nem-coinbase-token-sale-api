import { EmailAttachment } from 'services/email/email-service';
import { Request } from 'express';
import {
	KEY_ADDRESS_1, KEY_ADDRESS_2,
	KEY_CITY, KEY_COUNTRY,
	KEY_FULL_NAME,
	KEY_LEGAL_PHOTO_ID_PATH,
	KEY_PERSONAL_PICTURE_HOLDING_ID_PATH,
	KEY_PROOF_OF_RESIDENCE_PATH,
	KEY_TOKEN_RECIPIENT_ADDRESS,
	KEY_STATE,
	KEY_ZIP
} from 'utilities/validators';

export const kycTemplate = (req: Request): EmailAttachment => {

	const email: EmailAttachment = {
		to: process.env.KYC_EMAILS,
		subject: `KYC Form for ${req.body[KEY_FULL_NAME]}`,
		html: `<p>Name: ${req.body[KEY_FULL_NAME]}</p>
						<p>Address 1: ${req.body[KEY_ADDRESS_1]}</p>
						<p>Address 2: ${req.body[KEY_ADDRESS_2]}</p>
						<p>City: ${req.body[KEY_CITY]}</p>
						<p>State/Province/Region: ${req.body[KEY_STATE]}</p>
						<p>ZIP/Postal Code: ${req.body[KEY_ZIP]}</p>
						<p>Country: ${req.body[KEY_COUNTRY]}</p>
						<p>Token Recipient Address: ${req.body[KEY_TOKEN_RECIPIENT_ADDRESS]}</p>
						<p><img src="cid:legalPhotoId@blockstart.io"/></p>
						<p><img src="cid:personalPicture@blockstart.io"/></p>
						<p><img src="cid:proofResidence@blockstart.io"/></p>`,
		attachments: [
			{
				filename: 'legalPhotoId.png',
				path: req.body[KEY_LEGAL_PHOTO_ID_PATH].path,
				cid: 'legalPhotoId@blockstart.io'
			},
			{
				filename: 'personalPicture.png',
				path: req.body[KEY_PERSONAL_PICTURE_HOLDING_ID_PATH].path,
				cid: 'personalPicture@blockstart.io'
			},
			{
				filename: 'proofResidence.png',
				path: req.body[KEY_PROOF_OF_RESIDENCE_PATH].path,
				cid: 'proofResidence@blockstart.io'
			}
		]
	};

	return email;
};