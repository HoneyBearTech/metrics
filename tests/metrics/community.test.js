//Community template cases of the metrics tests (see shared.js)
//They install and delete folders in source/templates, so this file must run alone, after the others (see the test-metrics script)
require("./shared").run({community: true, port: 3005})
