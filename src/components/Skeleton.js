

function Skeleton({ props }) {

    const { page } = props;

    switch (page) {
        case 'navbar':
            return (<>
                <div role="status" className=" animate-pulse px-8 ">
                    <div className="flex justify-between w-full py-4">
                        <div className="h-2.5 w-1/3 bg-green-200 dark:bg-green-700 rounded-full"></div>
                        <div className="h-2.5 w-1/4 bg-green-200 dark:bg-green-700 rounded-full"></div>
                    </div>

                    <div className="flex justify-between w-full">
                        <div className="h-2.5 w-1/4 bg-green-200 dark:bg-green-700 rounded-full"></div>
                        <div className="h-2.5 w-1/3 bg-green-200 dark:bg-green-700 rounded-full"></div>
                    </div>
                </div>
            </>);
            break;

        default:
            break;
    }
}

export default Skeleton