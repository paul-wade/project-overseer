from setuptools import setup, find_packages

setup(
    name='project-overseer',
    version='0.1.0',
    description='Autonomous AI-Powered Software Development Ecosystem',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='Fluent Coding, LLC',
    author_email='paul.wade@fluentcoding.com',
    url='https://github.com/fluentcoding/project-overseer',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'github-api>=1.55',
        'docker>=5.0.0',
        'terraform-py>=0.10.0',
        'pytest>=7.0.0',
        'numpy>=1.20.0',
    ],
    extras_require={
        'dev': [
            'pytest',
            'pytest-cov',
            'mypy',
            'black',
            'flake8'
        ]
    },
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Scientific/Engineering :: Artificial Intelligence'
    ],
    python_requires='>=3.9',
    keywords='ai development autonomous agent tools',
    entry_points={
        'console_scripts': [
            'project-overseer=project_overseer.cli:main',
        ],
    },
    project_urls={
        'Bug Reports': 'https://github.com/fluentcoding/project-overseer/issues',
        'Source': 'https://github.com/fluentcoding/project-overseer',
    },
)
