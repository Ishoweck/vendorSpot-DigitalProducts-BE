interface Config {
    nodeEnv: string;
    port: number;
    mongodbUri: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    paystackSecretKey: string;
    paystackPublicKey: string;
    resendApiKey: string;
    emailFrom: string;
    frontendUrl: string;
    corsOrigins: string[];
    maxFileSize: number;
    allowedFileTypes: string[];
    bcryptRounds: number;
    cloudinaryUrl: string;
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
    logLevel: string;
}
export declare const config: Config;
export default config;
//# sourceMappingURL=config.d.ts.map