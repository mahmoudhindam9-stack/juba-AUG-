const fs = require("fs");
const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");
content = content.replace(
  `            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}`,
  `            </Button>
          </DialogFooter>
               </>
             )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}`,
);
fs.writeFileSync(path, content, "utf8");
