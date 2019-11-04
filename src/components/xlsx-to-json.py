#!/usr/bin/python3

"""

extracts key pieces from Excel spreadsheets into JSON

Emery Berger
Microsoft Research / University of Massachusetts Amherst
http://www.emeryberger.com

"""

import json
import time
import random
import openpyxl
import io
import os
import sys
import argparse
import warnings
import pprint

with warnings.catch_warnings():
    warnings.simplefilter("ignore")

# process a single worksheet
#   datatype = "f" --> functions
#   datatype = "n" --> numeric values


def process_sheet(worksheet, datatype="f"):
    processed = []
    for row in worksheet.rows:
        r = []
        for cell in row:
            v = ""
            if type(cell).__name__ != 'MergedCell':
                if cell.value is not None:
                    if cell.data_type == datatype:
                        v = str(cell.value)
            r.append(v)
        processed.append(r)
    return processed

# Get styles


properties = {'format': {
    'fill': {
        'color': True
    },
    'border': {
        'color': True,
        'style': True,
        'weight': True
    },
    'font': {
        'color': True,
        'style': True,
        'weight': True,
        'bold': True,
        'italic': True,
        'name': True
    }
}
}


def process_sheet_styles(worksheet):
    processed = []
    pp = pprint.PrettyPrinter(indent=8, depth=8)
    for row in worksheet.rows:
        r = []
        for cell in row:
            v = ""
            if type(cell).__name__ != 'MergedCell':
                v = str([vars(cell.font), vars(cell.fill), vars(cell.border)])
            r.append(v)
        processed.append(r)
    return processed


# Process every sheet in a workbook
def process_workbook(fname):
    with open(fname, 'rb') as f:
        in_mem_file = io.BytesIO(f.read())
    workbook = openpyxl.load_workbook(in_mem_file, read_only=False)
    output = {
        "workbookName": fname,
        "worksheets": []
    }
    for worksheet in workbook.worksheets:
        sheetname = worksheet.title

        # Extract formulas and numeric values.
        formulas = process_sheet(worksheet, "f")
        values = process_sheet(worksheet, "n")

        # Get the styles of each cell.
        styles = process_sheet_styles(worksheet)

        # Now get the sheet range info.
        numRows = worksheet.max_row
        numCols = worksheet.max_column

        lastColName = openpyxl.utils.cell.get_column_letter(numCols)
        sheetRange = sheetname + "!A1:" + lastColName + str(numRows)

        output["worksheets"].append({
            "sheetName": sheetname,
            "usedRangeAddress": sheetRange,
            "formulas": formulas,
            "values": values,
            "styles": styles
        })

    return output


# Process command line for file or directory.

parser = argparse.ArgumentParser('xlsx-to-json.py')
parser.add_argument('--input', help='Process an input .xlsx file.')
args = parser.parse_args()

if args.input is None:
    parser.print_help()
    exit(-1)

output = process_workbook(args.input)
str = json.dumps(output)
print(str)
