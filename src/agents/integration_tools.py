import os
import re
import json
import subprocess
from typing import Dict, Any, Optional
from github import Github, GithubException
import terraform_py
import docker

class AgentIntegrationToolkit:
    """
    Comprehensive agent integration and interaction toolkit
    
    Supported Integrations:
    - GitHub API interactions
    - Terraform infrastructure management
    - Docker container operations
    - Cloud platform interactions
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize integration toolkit with configuration
        
        Required Configuration:
        - github_token
        - terraform_path
        - docker_socket
        """
        self.config = config
        self.github_client = Github(config.get('github_token'))
        self.docker_client = docker.from_env()
    
    def github_create_pr(
        self, 
        repo_name: str, 
        base_branch: str, 
        head_branch: str, 
        title: str, 
        body: str
    ) -> Dict[str, Any]:
        """
        Create a GitHub Pull Request
        
        Args:
            repo_name: Full repository name (e.g., 'owner/repo')
            base_branch: Target branch for merge
            head_branch: Source branch with changes
            title: PR title
            body: PR description
        
        Returns:
            Pull Request details
        """
        try:
            repo = self.github_client.get_repo(repo_name)
            pr = repo.create_pull(
                title=title,
                body=body,
                head=head_branch,
                base=base_branch
            )
            return {
                'pr_number': pr.number,
                'pr_url': pr.html_url,
                'status': 'success'
            }
        except GithubException as e:
            return {
                'error': str(e),
                'status': 'failed'
            }
    
    def github_add_comment(
        self, 
        repo_name: str, 
        issue_number: int, 
        comment: str
    ) -> Dict[str, Any]:
        """
        Add a comment to a GitHub Issue or PR
        
        Args:
            repo_name: Full repository name
            issue_number: Issue or PR number
            comment: Comment text
        
        Returns:
            Comment submission status
        """
        try:
            repo = self.github_client.get_repo(repo_name)
            issue = repo.get_issue(issue_number)
            comment_obj = issue.create_comment(comment)
            
            return {
                'comment_id': comment_obj.id,
                'status': 'success'
            }
        except GithubException as e:
            return {
                'error': str(e),
                'status': 'failed'
            }
    
    def terraform_deploy(
        self, 
        terraform_dir: str, 
        action: str = 'apply'
    ) -> Dict[str, Any]:
        """
        Execute Terraform deployment operations
        
        Args:
            terraform_dir: Directory containing Terraform configurations
            action: Terraform action (apply/plan/destroy)
        
        Returns:
            Deployment operation results
        """
        try:
            # Terraform initialization
            init_result = subprocess.run(
                ['terraform', 'init'], 
                cwd=terraform_dir, 
                capture_output=True, 
                text=True
            )
            
            # Terraform action execution
            action_result = subprocess.run(
                ['terraform', action, '-auto-approve'], 
                cwd=terraform_dir, 
                capture_output=True, 
                text=True
            )
            
            return {
                'init_output': init_result.stdout,
                'action_output': action_result.stdout,
                'status': 'success' if action_result.returncode == 0 else 'failed'
            }
        except Exception as e:
            return {
                'error': str(e),
                'status': 'failed'
            }
    
    def docker_build_image(
        self, 
        dockerfile_path: str, 
        image_name: str, 
        tag: str = 'latest'
    ) -> Dict[str, Any]:
        """
        Build Docker image
        
        Args:
            dockerfile_path: Path to Dockerfile
            image_name: Name of the Docker image
            tag: Image tag
        
        Returns:
            Image build results
        """
        try:
            image, build_logs = self.docker_client.images.build(
                path=dockerfile_path,
                tag=f"{image_name}:{tag}"
            )
            
            return {
                'image_id': image.id,
                'build_logs': list(build_logs),
                'status': 'success'
            }
        except docker.errors.BuildError as e:
            return {
                'error': str(e),
                'status': 'failed'
            }
    
    def docker_deploy_container(
        self, 
        image_name: str, 
        container_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Deploy Docker container
        
        Args:
            image_name: Docker image to deploy
            container_config: Container configuration
        
        Returns:
            Container deployment results
        """
        try:
            container = self.docker_client.containers.run(
                image=image_name,
                **container_config
            )
            
            return {
                'container_id': container.id,
                'status': 'success'
            }
        except docker.errors.ContainerError as e:
            return {
                'error': str(e),
                'status': 'failed'
            }

class AgentCommunicationHandler:
    """
    Agent communication and invocation framework
    """
    @staticmethod
    def parse_agent_command(message: str) -> Optional[Dict[str, Any]]:
        """
        Parse agent invocation from message
        
        Syntax: @AgentName command [parameters]
        """
        agent_pattern = r'^@(\w+)\s+(.+)$'
        match = re.match(agent_pattern, message.strip())
        
        if match:
            agent_name = match.group(1)
            command = match.group(2)
            
            return {
                'agent': agent_name,
                'command': command
            }
        
        return None

# Example configuration and usage
def example_usage():
    config = {
        'github_token': os.getenv('GITHUB_TOKEN'),
        'terraform_path': '/path/to/terraform/configs',
        'docker_socket': 'unix://var/run/docker.sock'
    }
    
    toolkit = AgentIntegrationToolkit(config)
    
    # GitHub PR creation example
    pr_result = toolkit.github_create_pr(
        repo_name='owner/repo',
        base_branch='main',
        head_branch='feature/new-implementation',
        title='Autonomous Agent Update',
        body='Automated changes by Project Overseer'
    )
    
    # Terraform deployment example
    terraform_result = toolkit.terraform_deploy(
        terraform_dir='/path/to/infrastructure',
        action='apply'
    )
    
    # Docker image build example
    docker_build = toolkit.docker_build_image(
        dockerfile_path='./Dockerfile',
        image_name='project-overseer',
        tag='latest'
    )

if __name__ == "__main__":
    example_usage()
