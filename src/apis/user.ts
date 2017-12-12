import { Request, Response, Router } from "express";
import { ApiToolsService } from "../services/apiToolsService";
import { AccessGrantedService } from "../services/accessGrantedService";

// TODO VERIFIER LES PARAMETRES D'ENTRER DE CHAQUES METHODES
export class UserApi {

    static LOGIN: string = "login";
    static REGISTER: string = "register";
    static USER: string = "user/";
    private _userModel: any;

    constructor(userModel) {
        this._userModel = userModel;
    }

    public create(router: Router) {
        console.log("Creating apis.");
        router.post(ApiToolsService.BASE_API_V1+UserApi.LOGIN, AccessGrantedService.publicAccess, this.login.bind(this));
        router.post(ApiToolsService.BASE_API_V1+UserApi.REGISTER, AccessGrantedService.publicAccess, this.register.bind(this));
        router.get(ApiToolsService.BASE_API_V1+UserApi.USER, AccessGrantedService.publicAccess, this.getUsers.bind(this));
        router.get(ApiToolsService.BASE_API_V1+UserApi.USER+":id", AccessGrantedService.publicAccess, this.getUser.bind(this));
    }

    public getUsers(req: Request, res: Response) {
        this._userModel.find({})
            .then(users => ApiToolsService.sendJsonResponse(res, users, ApiToolsService.STATUS.OK))
            .catch(err => ApiToolsService.sendJsonResponse(res, err, ApiToolsService.STATUS.INTERNAL_SERVER_ERROR));
    }

    public getUser(req: Request, res: Response) {
        this._userModel.findOne({_id: req.params.id})
            .then(user => ApiToolsService.sendJsonResponse(res, user, ApiToolsService.STATUS.OK))
            .catch(err => ApiToolsService.sendJsonResponse(res, err, ApiToolsService.STATUS.INTERNAL_SERVER_ERROR));
    }

    public login(req: Request, res: Response) {
        this._userModel.findOne({email: req.body.email})
            .then(user => AccessGrantedService.authenticateUser(req, res, user))
            .catch(err => ApiToolsService.sendJsonResponse(res, err, ApiToolsService.STATUS.INTERNAL_SERVER_ERROR));
    }

    public register(req: Request, res: Response) {
        AccessGrantedService.cryptPassword(req.body.password).then(hashedPassword => {
            this._userModel.create({
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            }).then(user => ApiToolsService.sendJsonResponse(res, user, ApiToolsService.STATUS.OK))
                .catch(err => ApiToolsService.sendJsonResponse(res, err, ApiToolsService.STATUS.INTERNAL_SERVER_ERROR));
        });
    }
}