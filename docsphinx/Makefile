# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build
SOURCEDIR     = source
BUILDDIR      = build

PUBLISHDIR    = ../docs

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# reference
# https://www.docslikecode.com/articles/github-pages-python-sphinx/
# https://github.com/sphinx-doc/sphinx/issues/3382#issuecomment-470772316
ghpage:
	@rm -rf $(PUBLISHDIR)
	@rm -r $(BUILDDIR)
	@mkdir $(BUILDDIR)
	@make html
	@cp -a $(BUILDDIR)/html $(PUBLISHDIR)
	@touch $(PUBLISHDIR)/.nojekyll

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
