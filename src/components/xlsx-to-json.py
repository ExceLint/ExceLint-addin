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
from operator import mul
from collections import namedtuple
import operator
import itertools
import functools
import io
import os
import sys
import argparse
import warnings

with warnings.catch_warnings():
    warnings.simplefilter("ignore")


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


def process_workbook(fname):
    with open(fname, 'rb') as f:
        in_mem_file = io.BytesIO(f.read())
    workbook = openpyxl.load_workbook(in_mem_file, read_only=False)
    if workbook.active is not None:
        sheets = [workbook.active]
    else:
        sheets = workbook.worksheets
    for worksheet in sheets:
        sheetname = worksheet.title

        # Extract formulas and numeric values.
        formulas = process_sheet(worksheet, "f")
        values = process_sheet(worksheet, "n")

        # Now get the sheet range info.
        numRows = len(formulas)
        numCols = len(formulas[0])
        lastColName = openpyxl.utils.cell.get_column_letter(numCols)
        sheetRange = sheetname + "!A1:" + lastColName + str(numRows)

        output = {
            "usedRangeAddress": sheetRange,
            "formulas": formulas,
            "values": values
        }

        return output


def process_dir(inputdir):
    processed_files = []
    fnames = os.listdir(inputdir)
    # random.shuffle(fnames)
    for fname in fnames:
        # Skip subdirectories.
        if os.path.isdir(os.path.join(inputdir, fname)):
            continue
        # print(f"[{count}] processing {fname}", file=sys.stderr)
        try:
            processed_files.append(process_workbook(
                os.path.join(args.inputdir, fname)))
        except Exception:  # as error:
            pass
    return processed_files

# Process command line for file or directory.


parser = argparse.ArgumentParser('xlsx-to-json.py')
parser.add_argument('--input', help='Process a single input .xlsx file.')
parser.add_argument(
    '--inputdir', help='Process an entire directory of .xlsx files.')
args = parser.parse_args()

# Must be exactly one of either --input or --inputdir.
if args.input is None and args.inputdir is None:
    parser.print_help()
    exit(-1)

if args.input is not None and args.inputdir is not None:
    parser.print_help()
    exit(-1)

if args.inputdir is not None:
    outputs = process_dir(args.inputdir)
    # Not sure what to do with a whole directory... FIX ME
    print(outputs)
else:
    output = process_workbook(args.input)
    str = json.dumps(output)
    print(str)
