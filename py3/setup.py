import os
from setuptools import setup, find_packages

# import py2exe
# pip install wheel
# python setup.py bdist_wheel sdist
from pathlib import Path
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

version = '0.1.0'
print(f'--Anclient.py3 {version}--'),

setup(
    name='Anclient.py3',
    version=version,
    description='Portfolio Synode Stand Alone Service',
    author='Ody Z',
    zip_safe=False,
    author_email='odys.zhou@gmail.com',
    keywords='Documents Files Relational Database Synchronization',
    long_description=long_description,
    long_description_content_type='text/markdown',

    packages=['src'] + [f'src.{pkg}' for pkg in find_packages(where='src')],  # Include src and its subpackages
    package_dir={'src': 'src'},

    package_data={
    },

    entry_points={'console_scripts': ['synode-uninstall-srv = src.synodepy3.cli:uninst_srv', 'synode-clean = src.synodepy3.cli:clean', 'synode-start-web = src.synodepy3.cli:startweb']},

    include_package_data=True,
    
    install_requires=['anson.py3>=0.1.5', 'requests', 'typing_extensions']
    # classifiers=["Programming Language :: Python :: 3"]
)