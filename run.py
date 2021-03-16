#!/usr/bin/python3

import multiprocessing, os

def run(i):
    os.system('node run.js {0}'.format(i))
    pass

if __name__ == '__main__':
    jobs = []
    for i in range(30):
        print(i)
        job = multiprocessing.Process(target=run, args=[i])
        jobs.append(job)
        job.start()

    for job in jobs:
        job.join()

    print('END')
    # run(0)