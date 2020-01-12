import matplotlib.pyplot as plt
import csv

sheets = []
cells = []

items = []

suspiciousnessThreshold = 0
formattingDiscount = 0;

with open('stats.csv', 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        workbookName = row['workbookName']
        worksheet = row['worksheet']
        suspiciousnessThreshold = row['suspiciousnessThreshold']
        # Strip off .xlsx ending
        items.append((workbookName[:-5] + '!' + worksheet, row['suspiciousCells']))
        
sorted_items = sorted(items, key=lambda x: int(x[1]))
# print(sorted_items)

for item in sorted_items:
    if int(item[1]) > 0:
        sheets.append(item[0])
        cells.append(int(item[1]))
#    print(item[1])
    
max_cells = cells[-1]

plt.figure(figsize=(8,8))
plt.axes([0.1,0.2,0.9,0.6])
plt.title('ExceLint + CUSTODES: susp thresh = ' + str(suspiciousnessThreshold), y=1.02)
#plt.xlabel('Worksheet name')
plt.ylabel('# suspicious cells')
plt.ylim(0,max_cells)
plt.xticks(rotation='vertical', fontsize=4)
plt.tick_params(pad=0)
plt.bar(sheets, cells) # ['Foo', 'Bar'], [12, 13])
# plt.show()
plt.savefig('plot.png', dpi=300)

