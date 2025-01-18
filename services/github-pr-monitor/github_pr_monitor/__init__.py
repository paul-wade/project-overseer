import azure.functions as func
import logging
import os
from github import Github

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    GitHub Pull Request Monitoring Function
    
    Monitors GitHub PRs and triggers automated responses
    """
    logging.info('Python HTTP trigger function processed a request.')
    
    # GitHub authentication
    github_token = os.environ.get('GITHUB_TOKEN')
    if not github_token:
        return func.HttpResponse(
            "GitHub token not configured",
            status_code=500
        )
    
    try:
        # Initialize GitHub client
        g = Github(github_token)
        
        # Example: Get repository details
        repo_name = req.params.get('repo')
        if not repo_name:
            return func.HttpResponse(
                "Please provide a repository name",
                status_code=400
            )
        
        repo = g.get_repo(repo_name)
        
        # Retrieve open pull requests
        open_prs = repo.get_pulls(state='open')
        
        pr_details = [
            {
                'number': pr.number,
                'title': pr.title,
                'author': pr.user.login,
                'created_at': pr.created_at.isoformat()
            } for pr in open_prs
        ]
        
        return func.HttpResponse(
            json.dumps(pr_details),
            mimetype="application/json"
        )
    
    except Exception as e:
        logging.error(f"Error processing GitHub PRs: {e}")
        return func.HttpResponse(
            f"Error: {str(e)}",
            status_code=500
        )
