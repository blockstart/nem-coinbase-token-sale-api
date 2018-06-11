import { sendKYCEmail } from 'services/email/email-service';
import { Request, Response, Router } from 'express';
import { kycTemplate } from 'services/email/templates/kyc-template';
import { isImage, KEY_LEGAL_PHOTO_ID_PATH, KEY_PROOF_OF_RESIDENCE_PATH, KEY_PERSONAL_PICTURE_HOLDING_ID_PATH, vKYCEmail } from 'utilities/validators';

export const kyc = ({ db }: { db: any }) => {
	const api: Router = Router();

	/**
	 * We never store KYC in a database - it is forwarded into a gmail account
	 */
	api.put('/email', vKYCEmail, async (req: Request, res: Response) => {
		try {
			if (!(isImage(req.body[KEY_LEGAL_PHOTO_ID_PATH].path)) && req.body[KEY_PERSONAL_PICTURE_HOLDING_ID_PATH].path && req.body[KEY_PROOF_OF_RESIDENCE_PATH].path) {
				return res.status(409).json(new Error('Files must be jpg, png or tiff.'));
			}
			await sendKYCEmail(kycTemplate(req));
			return res.status(202).json({message: 'ok'});
		} catch (err) {
			res.status(409).json(err);
		}
	});

	return api;
};