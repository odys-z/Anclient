import os
import sys

from antlr4 import *
from pathlib import Path

from gen.JSONLexer import JSONLexer
from gen.JSONParser import JSONParser
from gen.JSONVisitor import JSONVisitor
from AST import AST, ValueNode


class Enveloparser(JSONVisitor):
    ast = AST()

    def visitType_pair(self, ctx: JSONParser.Type_pairContext):
        child_count = ctx.getChildCount()
        if child_count == 3:
            # _key = ctx.getChild(0).getText()
            etype = ctx.getChild(2).getText()
            self.ast.type(etype)
        return self.ast.env.type

    def visitPair(self, ctx: JSONParser.PairContext):
        child_count = ctx.getChildCount()
        if child_count == 3:
            key = ctx.getChild(0).getText()
            val = ctx.getChild(2).getText()
            self.ast.pair(key, val)
        return self.ast.env.fields[key]

    def visitArray(self, ctx: JSONParser.ArrayContext):
        return [ctx.getText()]

    def visitObj(self, ctx:JSONParser.ObjContext):
        return ValueNode(ctx.getChildren())

    def visitEnvelope(self, ctx: JSONParser.EnvelopeContext):
        self.ast.startEnvelope()
        for i in range(0, ctx.getChildCount(), 2):
            n = self.visit(ctx.getChild(i))
            print(n)
        return self.ast.env


def main(filenames):
    print("parsing: ", filenames)
    input_stream = FileStream(filenames[1])
    lexer = JSONLexer(input_stream)
    stream = CommonTokenStream(lexer)
    parser = JSONParser(stream)
    tree = parser.envelope()
    if parser.getNumberOfSyntaxErrors() > 0:
        print("syntax errors")
    else:
        parser = Enveloparser()
        x = parser.visit(tree)
        print(x.type, x.fields)
        
        Path(filenames[2]).mkdir(parents=True, exist_ok=True)
        f = open(os.path.join(filenames[2], 'out'), 'w+')
        print(x.type, file=f)
        f.writelines(map(lambda field: field + '\n', x.fields))
        f.close()


if __name__ == '__main__':
    main(sys.argv)
else:
    print("Parser command ignored:")
    print(__name__)
