from typing import Dict, Any, Optional
from github import Github, GithubException

class GitHubTool:
    """
    Comprehensive GitHub interaction tool
    
    Provides atomic, tool-like operations for GitHub interactions
    """
    
    def __init__(self, github_token: Optional[str] = None):
        """
        Initialize GitHub tool
        
        Args:
            github_token: GitHub Personal Access Token
        """
        self.client = Github(github_token) if github_token else Github()
    
    def create_pull_request(
        self, 
        repo_name: str, 
        base_branch: str, 
        head_branch: str, 
        title: str, 
        body: str = ""
    ) -> Dict[str, Any]:
        """
        Create a GitHub Pull Request
        
        Example:
            github_tool.create_pull_request(
                repo_name='owner/repo',
                base_branch='main', 
                head_branch='feature/new-implementation',
                title='Autonomous Agent Update'
            )
        """
        try:
            repo = self.client.get_repo(repo_name)
            pr = repo.create_pull(
                title=title,
                body=body,
                head=head_branch,
                base=base_branch
            )
            return {
                'status': 'success',
                'pr_number': pr.number,
                'pr_url': pr.html_url
            }
        except GithubException as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }
    
    def add_comment(
        self, 
        repo_name: str, 
        issue_number: int, 
        comment: str
    ) -> Dict[str, Any]:
        """
        Add a comment to a GitHub Issue or Pull Request
        
        Example:
            github_tool.add_comment(
                repo_name='owner/repo', 
                issue_number=42, 
                comment='Automated review complete'
            )
        """
        try:
            repo = self.client.get_repo(repo_name)
            issue = repo.get_issue(issue_number)
            comment_obj = issue.create_comment(comment)
            
            return {
                'status': 'success',
                'comment_id': comment_obj.id
            }
        except GithubException as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }
    
    def list_repositories(
        self, 
        org_name: Optional[str] = None, 
        type: str = 'all'
    ) -> Dict[str, Any]:
        """
        List repositories for a user or organization
        
        Args:
            org_name: Organization name (optional)
            type: Repository type (all, public, private)
        
        Example:
            github_tool.list_repositories(org_name='your-org')
        """
        try:
            if org_name:
                repos = self.client.get_organization(org_name).get_repos(type=type)
            else:
                repos = self.client.get_user().get_repos(type=type)
            
            return {
                'status': 'success',
                'repositories': [
                    {
                        'name': repo.full_name,
                        'private': repo.private,
                        'url': repo.html_url
                    } for repo in repos
                ]
            }
        except GithubException as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }

def github_tool(method: str, **kwargs) -> Dict[str, Any]:
    """
    Unified interface for GitHub tool operations
    
    Usage examples:
    github_tool('create_pull_request', repo_name='...', ...)
    github_tool('add_comment', repo_name='...', ...)
    github_tool('list_repositories', org_name='...')
    """
    tool = GitHubTool(github_token=kwargs.get('github_token'))
    
    method_map = {
        'create_pull_request': tool.create_pull_request,
        'add_comment': tool.add_comment,
        'list_repositories': tool.list_repositories
    }
    
    if method not in method_map:
        return {
            'status': 'error',
            'error_message': f'Invalid method: {method}'
        }
    
    return method_map[method](**{k: v for k, v in kwargs.items() if k != 'method'})
