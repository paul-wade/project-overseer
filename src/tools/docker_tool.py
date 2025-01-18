import os
from typing import Dict, Any, Optional
import docker
from docker.models.images import Image
from docker.models.containers import Container

class DockerTool:
    """
    Comprehensive Docker management tool
    
    Provides atomic, tool-like operations for container and image management
    """
    
    def __init__(self, docker_socket: Optional[str] = None):
        """
        Initialize Docker tool
        
        Args:
            docker_socket: Custom Docker socket path
        """
        self.client = docker.from_env() if not docker_socket else docker.DockerClient(base_url=docker_socket)
    
    def build_image(
        self, 
        dockerfile_path: str, 
        tag: Optional[str] = None,
        build_args: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Build a Docker image
        
        Example:
            docker_tool.build_image(
                dockerfile_path='./Dockerfile', 
                tag='my-app:latest',
                build_args={'VERSION': '1.0'}
            )
        """
        try:
            image, build_logs = self.client.images.build(
                path=dockerfile_path,
                tag=tag or 'latest',
                buildargs=build_args or {}
            )
            
            return {
                'status': 'success',
                'image_id': image.id,
                'image_tags': image.tags,
                'build_logs': list(build_logs)
            }
        except docker.errors.BuildError as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }
    
    def run_container(
        self, 
        image: str, 
        command: Optional[str] = None,
        detach: bool = True,
        ports: Optional[Dict[str, str]] = None,
        environment: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Run a Docker container
        
        Example:
            docker_tool.run_container(
                image='my-app:latest',
                command='python app.py',
                ports={'8000/tcp': '8000'},
                environment={'DEBUG': 'true'}
            )
        """
        try:
            container = self.client.containers.run(
                image=image,
                command=command,
                detach=detach,
                ports=ports or {},
                environment=environment or {}
            )
            
            return {
                'status': 'success',
                'container_id': container.id,
                'container_name': container.name
            }
        except docker.errors.ContainerError as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }
    
    def list_images(self, filter_options: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        List Docker images
        
        Example:
            docker_tool.list_images(filter_options={'dangling': 'false'})
        """
        try:
            images = self.client.images.list(filters=filter_options or {})
            
            return {
                'status': 'success',
                'images': [
                    {
                        'id': image.id,
                        'tags': image.tags,
                        'size': image.attrs.get('Size', 0)
                    } for image in images
                ]
            }
        except docker.errors.APIError as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }
    
    def remove_container(self, container_id: str, force: bool = False) -> Dict[str, Any]:
        """
        Remove a Docker container
        
        Example:
            docker_tool.remove_container('container_id', force=True)
        """
        try:
            container = self.client.containers.get(container_id)
            container.remove(force=force)
            
            return {
                'status': 'success',
                'container_id': container_id
            }
        except docker.errors.NotFound:
            return {
                'status': 'error',
                'error_message': f'Container {container_id} not found'
            }
        except docker.errors.APIError as e:
            return {
                'status': 'error',
                'error_message': str(e)
            }

def docker_tool(method: str, **kwargs) -> Dict[str, Any]:
    """
    Unified interface for Docker tool operations
    
    Usage examples:
    docker_tool('build_image', dockerfile_path='./Dockerfile')
    docker_tool('run_container', image='my-app:latest')
    docker_tool('list_images')
    """
    tool = DockerTool(docker_socket=kwargs.get('docker_socket'))
    
    method_map = {
        'build_image': tool.build_image,
        'run_container': tool.run_container,
        'list_images': tool.list_images,
        'remove_container': tool.remove_container
    }
    
    if method not in method_map:
        return {
            'status': 'error',
            'error_message': f'Invalid method: {method}'
        }
    
    return method_map[method](**{k: v for k, v in kwargs.items() if k != 'method'})
