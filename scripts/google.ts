import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const googleClient = new SecretManagerServiceClient();

export async function getSecret(name: string): Promise<string> {
    try {
        const path = `projects/993276037739/secrets/${name}/versions/latest`;
        const [version] = await googleClient.accessSecretVersion({
            name: path
        });
        return version.payload!.data!.toString();
    } catch (error) {
        console.error(error);
    }

    return "";
}