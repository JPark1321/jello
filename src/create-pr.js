import { commitFile, createPR, getBranchHash, deleteFile, createBranch } from "./pr-func"

export async function createPullRequest(input) {
    const { files_to_write, files_to_delete, pull_request_title, pull_request_description, branch_title } = input

    try{
        const baseHash = await getBranchHash('main');
        await createBranch(branch_title, baseHash)

        for (const file of files_to_write) {
            await commitFile(branch_title, file['filepath'], file['content'], "")
        }
        for (const file of files_to_delete) {
            await deleteFile(branch_title, file, "")
        }

        await createPR(pull_request_title, pull_request_description, branch_title, "main")

        return JSON.stringify(input)
    } catch (err) {
        return err.message
    }
}