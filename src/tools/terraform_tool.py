import os
import subprocess
from typing import Dict, Any, Optional

class TerraformTool:
    """
    Comprehensive Terraform infrastructure management tool
    
    Provides atomic, tool-like operations for infrastructure deployment
    """
    
    def __init__(self, terraform_dir: Optional[str] = None):
        """
        Initialize Terraform tool
        
        Args:
            terraform_dir: Default directory for Terraform configurations
        """
        self.default_dir = terraform_dir or os.getcwd()
    
    def _run_terraform_command(
        self, 
        action: str, 
        directory: Optional[str] = None, 
        variables: Optional[Dict[str, str]] = None,
        auto_approve: bool = False
    ) -> Dict[str, Any]:
        """
        Execute a Terraform command
        
        Args:
            action: Terraform action (init, plan, apply, destroy)
            directory: Terraform configuration directory
            variables: Optional Terraform variables
            auto_approve: Automatically approve changes
        """
        cmd = ['terraform', action]
        
        if auto_approve and action in ['apply', 'destroy']:
            cmd.append('-auto-approve')
        
        if variables:
            for key, value in variables.items():
                cmd.extend(['-var', f'{key}={value}'])
        
        try:
            result = subprocess.run(
                cmd, 
                cwd=directory or self.default_dir,
                capture_output=True, 
                text=True,
                check=True
            )
            
            return {
                'status': 'success',
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.CalledProcessError as e:
            return {
                'status': 'error',
                'error_message': str(e),
                'stdout': e.stdout,
                'stderr': e.stderr
            }
    
    def init(self, directory: Optional[str] = None) -> Dict[str, Any]:
        """
        Initialize Terraform working directory
        
        Example:
            terraform_tool.init('/path/to/terraform/configs')
        """
        return self._run_terraform_command('init', directory)
    
    def plan(
        self, 
        directory: Optional[str] = None, 
        variables: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Generate Terraform execution plan
        
        Example:
            terraform_tool.plan(
                directory='/infra', 
                variables={'region': 'us-west-2'}
            )
        """
        return self._run_terraform_command('plan', directory, variables)
    
    def apply(
        self, 
        directory: Optional[str] = None, 
        variables: Optional[Dict[str, str]] = None,
        auto_approve: bool = False
    ) -> Dict[str, Any]:
        """
        Apply Terraform configuration
        
        Example:
            terraform_tool.apply(
                directory='/infra', 
                variables={'instance_type': 't3.micro'},
                auto_approve=True
            )
        """
        return self._run_terraform_command('apply', directory, variables, auto_approve)
    
    def destroy(
        self, 
        directory: Optional[str] = None, 
        variables: Optional[Dict[str, str]] = None,
        auto_approve: bool = False
    ) -> Dict[str, Any]:
        """
        Destroy Terraform-managed infrastructure
        
        Example:
            terraform_tool.destroy(
                directory='/infra', 
                auto_approve=True
            )
        """
        return self._run_terraform_command('destroy', directory, variables, auto_approve)

def terraform_tool(method: str, **kwargs) -> Dict[str, Any]:
    """
    Unified interface for Terraform tool operations
    
    Usage examples:
    terraform_tool('init', directory='/infra')
    terraform_tool('apply', variables={'region': 'us-west-2'})
    terraform_tool('destroy', auto_approve=True)
    """
    tool = TerraformTool(terraform_dir=kwargs.get('directory'))
    
    method_map = {
        'init': tool.init,
        'plan': tool.plan,
        'apply': tool.apply,
        'destroy': tool.destroy
    }
    
    if method not in method_map:
        return {
            'status': 'error',
            'error_message': f'Invalid method: {method}'
        }
    
    return method_map[method](**{k: v for k, v in kwargs.items() if k != 'method'})
