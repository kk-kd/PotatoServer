import csv

filename = 'students.csv'
filename2 = 'students_updated.csv'
with open(filename, 'r') as csvfile:
    with open(filename2, 'w') as newfile:
        csvreader = csv.reader(csvfile)
        csvwriter = csv.writer(newfile)

        fields = next(csvreader)
        csvwriter.writerow(fields)

        for row in csvreader:
            new_row = [row[0], row[1], row[2], row[3].split('@')[0] + '@example.com']
            # new_row = [row[0], row[1].split('@')[0] + '@example.com', row[2]]
            csvwriter.writerow(new_row)